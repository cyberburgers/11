<?php
/* =====================================================================
   SEVİLEN KUYUMCULUK — ŞUKOB FİYAT KÖPRÜSÜ
   ŞUKOB sayfasındaki fiyat listesini okur, sitenin anlayacağı sade bir
   JSON'a çevirir ve kısa süre önbellekte tutar.

   Neden gerekli? Ziyaretçinin tarayıcısı başka bir sitenin verisini
   doğrudan okuyamaz (tarayıcı güvenliği). Bu dosya sizin sunucunuzda
   çalışıp veriyi sizin adınıza alır.

   Gereken: PHP 7.4 veya üstü, cURL ve DOM eklentileri (hostinglerin
   neredeyse hepsinde açıktır). "onbellek" klasörü yazılabilir olmalı.

   Kurulum testi: tarayıcıda  siteniz.com/api/fiyatlar.php?tani=1
   Her şey yolundaysa, TANI_ACIK değerini false yapın.
   ===================================================================== */

// ---- AYARLAR ----------------------------------------------------------
const KAYNAK_URL     = 'https://sukobfiyat.com/';
const ONBELLEK_SN    = 20;          // kaynağa en fazla bu sıklıkta gidilir
const BAYAT_SINIR_SN = 6 * 3600;    // bundan eski fiyat hiç gösterilmez
const ZAMAN_ASIMI_SN = 8;
const EN_AZ_KALEM    = 3;           // bundan az satır okunursa okuma başarısız sayılır
const TANI_ACIK      = true;        // kurulum bitince false yapın
// -----------------------------------------------------------------------

date_default_timezone_set('Europe/Istanbul');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');

$klasor        = __DIR__ . '/onbellek';
$onbellekDosya = $klasor . '/fiyatlar.json';
$kilitDosya    = $klasor . '/kilit';

if (!is_dir($klasor)) {
    @mkdir($klasor, 0755, true);
}

if (TANI_ACIK && isset($_GET['tani'])) {
    tani();
    exit;
}

$onbellek = onbellekOku($onbellekDosya);
$yas      = $onbellek ? time() - $onbellek['zaman'] : PHP_INT_MAX;

// Önbellek tazeyse doğrudan onu gönder
if ($yas < ONBELLEK_SN) {
    cevap($onbellek, false);
}

// Aynı anda gelen ziyaretçilerin hepsi ŞUKOB'a gitmesin: tek istek gider
$kilit = @fopen($kilitDosya, 'c');
if ($kilit && !flock($kilit, LOCK_EX | LOCK_NB)) {
    if ($onbellek && $yas < BAYAT_SINIR_SN) {
        cevap($onbellek, $yas > ONBELLEK_SN * 6);
    }
    flock($kilit, LOCK_EX); // önbellek yoksa diğer isteğin bitmesini bekle
    $onbellek = onbellekOku($onbellekDosya);
    if ($onbellek && time() - $onbellek['zaman'] < ONBELLEK_SN) {
        cevap($onbellek, false);
    }
}

$html    = indir(KAYNAK_URL, $hata);
$kalemler = $html !== null ? sayfadanFiyatlar($html) : [];

if (count($kalemler) >= EN_AZ_KALEM) {
    $yeni = ['zaman' => time(), 'kalemler' => $kalemler];
    @file_put_contents($onbellekDosya, json_encode($yeni, JSON_UNESCAPED_UNICODE), LOCK_EX);
    cevap($yeni, false);
}

// Kaynak okunamadı: son bilinen fiyatları "bayat" işaretiyle gönder
if ($onbellek && time() - $onbellek['zaman'] < BAYAT_SINIR_SN) {
    cevap($onbellek, true);
}

http_response_code(503);
echo json_encode([
    'ok'   => false,
    'hata' => $html === null ? 'Kaynağa ulaşılamadı: ' . $hata : 'Kaynak sayfada fiyat bulunamadı',
], JSON_UNESCAPED_UNICODE);
exit;


/* ===================================================================== */

function cevap(array $veri, bool $bayat)
{
    echo json_encode([
        'ok'         => true,
        'kaynak'     => 'ŞUKOB',
        'guncelleme' => date('c', $veri['zaman']),
        'bayat'      => $bayat,
        'kalemler'   => $veri['kalemler'],
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function onbellekOku(string $dosya)
{
    if (!is_file($dosya)) {
        return null;
    }
    $veri = json_decode((string) @file_get_contents($dosya), true);
    return is_array($veri) && isset($veri['zaman'], $veri['kalemler']) ? $veri : null;
}

function indir(string $url, &$hata = null)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT        => ZAMAN_ASIMI_SN,
        CURLOPT_ENCODING       => '',
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; SevilenKuyumculuk/1.0; +fiyat-listesi)',
        CURLOPT_HTTPHEADER     => ['Accept: text/html,application/json;q=0.9,*/*;q=0.8', 'Accept-Language: tr-TR,tr;q=0.9'],
    ]);
    $govde = curl_exec($ch);
    $kod   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $hata  = curl_error($ch);
    curl_close($ch);

    if ($govde === false || $kod >= 400 || $govde === '') {
        $hata = $hata ?: ('HTTP ' . $kod);
        return null;
    }
    return (string) $govde;
}

/**
 * Sayfadaki her satırı (tablo satırı ya da liste öğesi) okur.
 * Bir satırın başındaki yazı ürün adı, ardından gelen ilk iki sayı
 * alış ve satış olarak alınır.
 */
function sayfadanFiyatlar(string $html): array
{
    // Kaynak doğrudan JSON veriyorsa
    $json = json_decode($html, true);
    if (is_array($json)) {
        return jsondanFiyatlar($json);
    }

    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
    libxml_clear_errors();
    $xp = new DOMXPath($dom);

    $satirlar = [];
    foreach ($xp->query('//tr') as $tr) {
        $hucreler = [];
        foreach ($xp->query('./td|./th', $tr) as $td) {
            $hucreler[] = temizle($td->textContent);
        }
        $satirlar[] = $hucreler;
    }

    // Tablo yoksa div/li tabanlı listeleri dene
    if (!satirlardanFiyatlar($satirlar)) {
        $satirlar = [];
        $sorgu = '//li | //*[contains(concat(" ", normalize-space(@class), " "), " row ")]'
               . ' | //*[contains(@class, "item")] | //*[contains(@class, "satir")] | //*[contains(@class, "fiyat")]';
        foreach ($xp->query($sorgu) as $el) {
            $hucreler = [];
            foreach ($el->childNodes as $cocuk) {
                $metin = temizle($cocuk->textContent);
                if ($metin !== '') {
                    $hucreler[] = $metin;
                }
            }
            $satirlar[] = $hucreler;
        }
    }

    return satirlardanFiyatlar($satirlar);
}

function satirlardanFiyatlar(array $satirlar): array
{
    $sonuc = [];
    $gorulen = [];
    foreach ($satirlar as $hucreler) {
        $kalem = satirCoz($hucreler);
        if (!$kalem) {
            continue;
        }
        $anahtar = mb_strtoupper($kalem['ad'], 'UTF-8');
        if (isset($gorulen[$anahtar])) {
            continue;
        }
        $gorulen[$anahtar] = true;
        $sonuc[] = $kalem;
    }
    return $sonuc;
}

function satirCoz(array $hucreler)
{
    $ad = '';
    $sayilar = [];
    foreach ($hucreler as $hucre) {
        if ($hucre === '') {
            continue;
        }
        $sayi = sayiCoz($hucre);
        if ($sayi !== null) {
            if ($ad !== '') {
                $sayilar[] = $sayi;
            }
            continue;
        }
        $harfVar = preg_match('/\p{L}/u', $hucre) === 1;
        if (!$harfVar) {
            continue; // değişim yüzdesi, ok işareti vb.
        }
        if ($ad === '') {
            // Hücrede ad ve sayılar birlikte olabilir: "22 AYAR 3.100,00 3.200,00"
            list($ad, $icSayilar) = adVeSayilar($hucre);
            $sayilar = array_merge($sayilar, $icSayilar);
        }
    }
    if ($ad === '' || count($sayilar) < 1 || mb_strlen($ad, 'UTF-8') > 60) {
        return null;
    }
    return [
        'ad'    => $ad,
        'alis'  => count($sayilar) >= 2 ? $sayilar[0] : null,
        'satis' => count($sayilar) >= 2 ? $sayilar[1] : $sayilar[0],
    ];
}

/** "22 AYAR BİLEZİK 3.100,00 3.200,00 %0,5" -> ["22 AYAR BİLEZİK", [3100, 3200]] */
function adVeSayilar(string $metin): array
{
    $parcalar = preg_split('/\s+/u', $metin);
    $sayilar = [];
    while ($parcalar) {
        $son = end($parcalar);
        if (strpos($son, '%') !== false || in_array($son, ['₺', 'TL', '$', '€', '▲', '▼', '-'], true)) {
            array_pop($parcalar);
            continue;
        }
        $sayi = sayiCoz($son);
        if ($sayi === null || count($parcalar) === 1) {
            break;
        }
        array_unshift($sayilar, $sayi);
        array_pop($parcalar);
    }
    return [trim(implode(' ', $parcalar)), $sayilar];
}

/** Türkçe ("3.245,50") ve İngilizce ("3245.50") yazılmış sayıları okur. */
function sayiCoz(string $s)
{
    $s = trim(str_replace(["\xc2\xa0", ' ', '₺', 'TL', '$', '€', '£'], '', $s));
    if ($s === '' || !preg_match('/^\d[\d.,]*$/', $s)) {
        return null;
    }
    $nokta  = strrpos($s, '.');
    $virgul = strrpos($s, ',');

    if ($nokta !== false && $virgul !== false) {
        if ($virgul > $nokta) {
            $s = str_replace(['.', ','], ['', '.'], $s);   // 3.245,50
        } else {
            $s = str_replace(',', '', $s);                 // 3,245.50
        }
    } elseif ($virgul !== false) {
        $s = substr_count($s, ',') > 1 ? str_replace(',', '', $s) : str_replace(',', '.', $s);
    } elseif ($nokta !== false) {
        // "3.245" binlik ayırıcı mı, ondalık mı? Tek nokta + tam 3 hane -> binlik say
        if (substr_count($s, '.') > 1 || preg_match('/^\d{1,3}\.\d{3}$/', $s)) {
            $s = str_replace('.', '', $s);
        }
    }
    return is_numeric($s) ? (float) $s : null;
}

function temizle(string $s): string
{
    return trim(preg_replace('/\s+/u', ' ', $s));
}

/** Kaynak JSON verirse: [{"ad"/"name"/"isim", "alis"/"buy", "satis"/"sell"}] biçimlerini dener. */
function jsondanFiyatlar(array $json): array
{
    $sonuc = [];
    $liste = isset($json['data']) && is_array($json['data']) ? $json['data'] : $json;
    foreach ($liste as $anahtar => $oge) {
        if (!is_array($oge)) {
            continue;
        }
        $ad    = alanBul($oge, ['ad', 'isim', 'name', 'title', 'baslik', 'code', 'kod']) ?? (is_string($anahtar) ? $anahtar : null);
        $alis  = alanBul($oge, ['alis', 'Alış', 'alış', 'buy', 'bid']);
        $satis = alanBul($oge, ['satis', 'Satış', 'satış', 'sell', 'ask']);
        $alis  = is_numeric($alis) ? (float) $alis : (is_string($alis) ? sayiCoz($alis) : null);
        $satis = is_numeric($satis) ? (float) $satis : (is_string($satis) ? sayiCoz($satis) : null);
        if ($ad && ($alis !== null || $satis !== null)) {
            $sonuc[] = ['ad' => (string) $ad, 'alis' => $alis, 'satis' => $satis];
        }
    }
    return $sonuc;
}

function alanBul(array $oge, array $adaylar)
{
    foreach ($adaylar as $a) {
        if (isset($oge[$a]) && $oge[$a] !== '') {
            return $oge[$a];
        }
    }
    return null;
}

/** Kurulum sırasında neyin okunduğunu gösterir: api/fiyatlar.php?tani=1 */
function tani()
{
    // Tanı sayfası önbelleği atlayıp ŞUKOB'a doğrudan gider; art arda
    // açılarak kaynağın yorulmasın diye 10 saniyede bir kez çalışır.
    $zamanDosya = __DIR__ . '/onbellek/tani-zamani';
    $son = is_file($zamanDosya) ? (int) @file_get_contents($zamanDosya) : 0;
    if (time() - $son < 10) {
        http_response_code(429);
        echo json_encode(['hata' => 'Tanı sayfası 10 saniyede bir açılabilir, biraz bekleyip yenileyin.'], JSON_UNESCAPED_UNICODE);
        return;
    }
    @file_put_contents($zamanDosya, (string) time());

    $bas  = microtime(true);
    $html = indir(KAYNAK_URL, $hata);
    $sure = round((microtime(true) - $bas) * 1000);

    $rapor = [
        'kaynak'        => KAYNAK_URL,
        'sure_ms'       => $sure,
        'ulasildi'      => $html !== null,
        'hata'          => $html === null ? $hata : null,
        'sayfa_boyutu'  => $html !== null ? strlen($html) : 0,
        'okunan_kalemler' => [],
        'ipuclari'      => [],
    ];

    if ($html !== null) {
        $rapor['okunan_kalemler'] = sayfadanFiyatlar($html);

        // Fiyatlar JavaScript ile sonradan yükleniyorsa asıl adresi bulmaya yardım et
        if (preg_match_all('#(?:https?:)?//[^\s"\'<>]+|["\'](/[^"\'\s<>]*(?:api|json|fiyat|price|socket|ajax)[^"\'\s<>]*)["\']#i', $html, $m)) {
            $adresler = array_filter(array_unique(array_merge($m[0], $m[1])), function ($u) {
                return $u && preg_match('#api|json|fiyat|price|socket|ajax|\.js#i', $u);
            });
            $rapor['sayfadaki_adresler'] = array_values(array_slice($adresler, 0, 40));
        }
        if (!$rapor['okunan_kalemler']) {
            $rapor['ipuclari'][] = 'Sayfada fiyat satırı bulunamadı. Fiyatlar büyük ihtimalle JavaScript ile sonradan yükleniyor; "sayfadaki_adresler" listesindeki api/json/socket adreslerinden biri asıl kaynaktır.';
        }
    }
    if (!is_writable(dirname(__FILE__) . '/onbellek')) {
        $rapor['ipuclari'][] = 'api/onbellek klasörü yazılabilir değil. Hosting panelinden izinlerini 755 yapın.';
    }

    echo json_encode($rapor, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}
