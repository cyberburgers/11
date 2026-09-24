<?php
/* =====================================================================
   SEVİLEN KUYUMCULUK — FİYAT UÇ NOKTASI
   ŞUKOB fiyat servisini sunucuda çağırır (tarayıcıdan çağrılamaz, CORS
   izni yok), sadeleştirir ve kısa süre önbellekte tutar.

   Çıktı: [{"ad","kod","alis","satis","guncelleme"}, ...]
   Başlık: X-Fiyat-Durumu: taze | bayat  (bayat = kaynağa ulaşılamadı,
           son başarılı veri dönüyor)
   Hiç veri yoksa: 502 {"hata":"Fiyatlar alınamadı"}

   Ayarlar: api/ayarlar.php
   Kurulum testi: api/fiyatlar.php?tani=1
   Gereken: PHP 7.4+, cURL. "api/onbellek" klasörü yazılabilir olmalı.
   ===================================================================== */

date_default_timezone_set('Europe/Istanbul');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

$AYAR = require __DIR__ . '/ayarlar.php';

// Test için kaynak adresi SUKOB_URL ortam değişkeniyle değiştirilebilir
if (getenv('SUKOB_URL')) {
    $AYAR['kaynak_url'] = getenv('SUKOB_URL');
}

$klasor        = __DIR__ . '/onbellek';
$onbellekDosya = $klasor . '/kaynak.json';
$hataDosya     = $klasor . '/son-hata.json';
$kilitDosya    = $klasor . '/kilit';

if (!is_dir($klasor)) {
    @mkdir($klasor, 0755, true);
}

if (!empty($AYAR['tani_acik']) && isset($_GET['tani'])) {
    tani($AYAR, $onbellekDosya, $hataDosya);
    exit;
}

// Kaynağa 10 saniyeden sık gidilmez
$sure     = max(10, (int) ($AYAR['onbellek_sn'] ?? 30));
$onbellek = onbellekOku($onbellekDosya);

if ($onbellek && time() - $onbellek['zaman'] < $sure) {
    cevap($onbellek['liste'], $AYAR, 'taze');
}

// Cloudflare engeli görüldüyse bir süre kaynağı hiç denemeyiz (tekrar deneme döngüsü yok)
$sonHata = is_file($hataDosya) ? json_decode((string) @file_get_contents($hataDosya), true) : null;
$bekleme = (int) ($AYAR['engel_bekleme_sn'] ?? 600);
if (!empty($sonHata['cloudflare']) && time() - (int) ($sonHata['unix'] ?? 0) < $bekleme) {
    if ($onbellek) {
        cevap($onbellek['liste'], $AYAR, 'bayat');
    }
    http_response_code(502);
    echo json_encode(['hata' => 'Fiyatlar alınamadı'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Aynı anda gelen ziyaretçilerin hepsi kaynağa gitmesin: yalnızca biri gider
$kilit = @fopen($kilitDosya, 'c');
if ($kilit && !flock($kilit, LOCK_EX | LOCK_NB)) {
    if ($onbellek) {
        cevap($onbellek['liste'], $AYAR, 'taze');
    }
    flock($kilit, LOCK_EX); // önbellek hiç yoksa diğer isteğin bitmesini bekle
    $onbellek = onbellekOku($onbellekDosya);
    if ($onbellek && time() - $onbellek['zaman'] < $sure) {
        cevap($onbellek['liste'], $AYAR, 'taze');
    }
}

$sonuc = kaynaktanCek($AYAR);

if ($sonuc['liste']) {
    @file_put_contents($onbellekDosya, json_encode(['zaman' => time(), 'liste' => $sonuc['liste']], JSON_UNESCAPED_UNICODE), LOCK_EX);
    cevap($sonuc['liste'], $AYAR, 'taze');
}

// Kaynak hata verdi ya da JSON bozuk: sebebi kaydet, son başarılı veriyi dön
@file_put_contents($hataDosya, json_encode([
    'zaman'      => date('c'),
    'unix'       => time(),
    'http_kodu'  => $sonuc['http_kodu'],
    'cloudflare' => $sonuc['cloudflare'],
    'mesaj'      => $sonuc['hata'],
], JSON_UNESCAPED_UNICODE));

if ($onbellek) {
    cevap($onbellek['liste'], $AYAR, 'bayat');
}

http_response_code(502);
echo json_encode(['hata' => 'Fiyatlar alınamadı'], JSON_UNESCAPED_UNICODE);
exit;


/* ===================================================================== */

/** Ayarlardaki ürünleri sırasıyla seçer, kâr marjını ekler ve gönderir. */
function cevap(array $liste, array $ayar, string $durum)
{
    $marj  = (float) ($ayar['kar_marji_yuzde'] ?? 0);
    $kodla = [];
    foreach ($liste as $oge) {
        $kodla[$oge['kod']] = $oge;
    }

    $cikti = [];
    foreach (($ayar['urunler'] ?? []) as $kod => $ad) {
        if (!isset($kodla[$kod])) {
            continue;
        }
        $oge = $kodla[$kod];
        $cikti[] = [
            'ad'         => $ad !== null && $ad !== '' ? $ad : $oge['ad'],
            'kod'        => $kod,
            // Kaynaktaki kayan nokta artıkları temizlenir; ekranda kaç hane
            // gösterileceğine js/ayarlar.js (FIYAT_TABLOSU.ondalik) karar verir.
            'alis'       => round($oge['alis'], 4),
            'satis'      => round($oge['satis'] * (1 + $marj / 100), 4),
            'guncelleme' => $oge['guncelleme'],
        ];
    }

    header('X-Fiyat-Durumu: ' . $durum);
    echo json_encode($cikti, JSON_UNESCAPED_UNICODE);
    exit;
}

function onbellekOku(string $dosya)
{
    if (!is_file($dosya)) {
        return null;
    }
    $veri = json_decode((string) @file_get_contents($dosya), true);
    return is_array($veri) && isset($veri['zaman']) && !empty($veri['liste']) ? $veri : null;
}

/**
 * Kaynağı çağırır. Dönüş: liste (başarılıysa dolu), http_kodu, cloudflare, hata.
 * Cloudflare engeli tespit edilirse yalnızca kaydedilir; aşılmaya çalışılmaz.
 */
function kaynaktanCek(array $ayar): array
{
    $url = $ayar['kaynak_url'] . (strpos($ayar['kaynak_url'], '?') === false ? '?' : '&')
         . 'cache=' . (int) round(microtime(true) * 1000);

    $basliklar = [];
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => (int) ($ayar['zaman_asimi_sn'] ?? 8),
        CURLOPT_ENCODING       => '',
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (sukob-fiyat)',
        CURLOPT_REFERER        => 'https://sukobfiyat.com/',
        // sukobfiyat.com sayfasının kendi isteğiyle aynı başlıklar
        CURLOPT_HTTPHEADER     => ['Accept: application/json, text/javascript, */*; q=0.01', 'X-Requested-With: XMLHttpRequest'],
        CURLOPT_HEADERFUNCTION => function ($ch, $satir) use (&$basliklar) {
            $parca = explode(':', $satir, 2);
            if (count($parca) === 2) {
                $basliklar[strtolower(trim($parca[0]))] = trim($parca[1]);
            }
            return strlen($satir);
        },
    ]);
    $govde = curl_exec($ch);
    $kod   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $hata  = curl_error($ch);
    curl_close($ch);

    $sonuc = ['liste' => [], 'http_kodu' => $kod, 'cloudflare' => false, 'hata' => null];

    // 403 / 429 / 503 ya da JSON yerine HTML sayfası: Cloudflare engeli say, aşmaya çalışma
    if (in_array($kod, [403, 429, 503], true)) {
        $sonuc['cloudflare'] = true;
        $sonuc['hata'] = 'Kaynak ' . $kod . ' döndü (muhtemel Cloudflare engeli)';
        return $sonuc;
    }
    if (is_string($govde) && $govde !== '' && ltrim($govde)[0] !== '['
        && (stripos($govde, '<html') !== false || stripos($govde, 'Just a moment') !== false)) {
        $sonuc['cloudflare'] = true;
        $sonuc['hata'] = 'JSON yerine HTML/doğrulama sayfası geldi (muhtemel Cloudflare engeli)';
        return $sonuc;
    }
    if ($govde === false || $govde === '') {
        $sonuc['hata'] = 'Kaynağa ulaşılamadı: ' . ($hata ?: 'boş yanıt');
        return $sonuc;
    }
    if ($kod >= 400) {
        $sonuc['hata'] = 'Kaynak HTTP ' . $kod . ' döndü';
        return $sonuc;
    }

    $veri = json_decode($govde, true);
    if (!is_array($veri)) {
        $sonuc['hata'] = 'Kaynaktan gelen JSON bozuk';
        return $sonuc;
    }

    foreach ($veri as $oge) {
        if (!is_array($oge) || empty($oge['url']) || !is_numeric($oge['buyPrice'] ?? null) || !is_numeric($oge['sellPrice'] ?? null)) {
            continue;
        }
        $sonuc['liste'][] = [
            'kod'        => (string) $oge['url'],
            'ad'         => (string) ($oge['type'] ?? $oge['url']),
            'alis'       => (float) $oge['buyPrice'],
            'satis'      => (float) $oge['sellPrice'],
            'guncelleme' => tarihCevir($oge['lastUpdate'] ?? ''),
        ];
    }
    if (!$sonuc['liste']) {
        $sonuc['hata'] = 'Kaynaktan gelen veride fiyat yok';
    }
    return $sonuc;
}

/** "24-09-2026 20:36:16" → "2026-09-24T20:36:16+03:00" */
function tarihCevir(string $metin)
{
    $t = DateTime::createFromFormat('d-m-Y H:i:s', trim($metin), new DateTimeZone('Europe/Istanbul'));
    return $t ? $t->format('c') : null;
}

/** Kurulum testi: kaynağı doğrudan çağırır ve ne olduğunu anlatır. 10 sn'de bir çalışır. */
function tani(array $ayar, string $onbellekDosya, string $hataDosya)
{
    $zamanDosya = dirname($onbellekDosya) . '/tani-zamani';
    $son = is_file($zamanDosya) ? (int) @file_get_contents($zamanDosya) : 0;
    if (time() - $son < 10) {
        http_response_code(429);
        echo json_encode(['hata' => 'Tanı sayfası 10 saniyede bir açılabilir, biraz bekleyip yenileyin.'], JSON_UNESCAPED_UNICODE);
        return;
    }
    @file_put_contents($zamanDosya, (string) time());

    $bas   = microtime(true);
    $sonuc = kaynaktanCek($ayar);
    $kodlar = array_column($sonuc['liste'], 'kod');

    $rapor = [
        'kaynak'           => $ayar['kaynak_url'],
        'sure_ms'          => (int) round((microtime(true) - $bas) * 1000),
        'http_kodu'        => $sonuc['http_kodu'],
        'basarili'         => (bool) $sonuc['liste'],
        'hata'             => $sonuc['hata'],
        'cloudflare_engeli' => $sonuc['cloudflare'],
        'kaynaktaki_kodlar' => $kodlar,
        'ayarlarda_olup_kaynakta_olmayan' => array_values(array_diff(array_keys($ayar['urunler'] ?? []), $kodlar)),
        'ilk_kalemler'     => array_slice($sonuc['liste'], 0, 3),
        'onbellek_yazilabilir' => is_writable(dirname($onbellekDosya)),
        'son_kaydedilen_hata'  => is_file($hataDosya) ? json_decode((string) file_get_contents($hataDosya), true) : null,
    ];
    if ($sonuc['cloudflare']) {
        $rapor['ipucu'] = 'Kaynak, sunucunuzu Cloudflare ile engelliyor. Engelden sonra kaynak ' . (int) ($ayar['engel_bekleme_sn'] ?? 600) . ' saniye denenmez. Bu engel aşılmaya çalışılmamalı; ŞUKOB ile iletişime geçip sunucu IP adresiniz için izin ya da resmî veri erişimi isteyin.';
    }
    echo json_encode($rapor, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
