# Sevilen Kuyumculuk — Web Sitesi

Sade, tek sayfalık fiyat panosu: canlı saat, altın / sarrafiye / döviz ve gümüş için tek alış-satış tablosu, iletişim bilgileri ve WhatsApp düğmesi.

- **İki tema:** Beyaz (varsayılan) ve koyu zümrüt. Ziyaretçi üst çubuktaki ay/güneş düğmesiyle değiştirir, seçimi tarayıcısında hatırlanır.
- **Telefonda:** üst çubukta ara ve WhatsApp düğmeleri, "Ana ekrana ekle" ikonu. Müşteri fiyat sayfasını uygulama gibi ekranına ekleyebilir.
- **Paylaşım:** Site linki WhatsApp'ta paylaşılınca logolu önizleme görseli çıkar. Google için işletme bilgisi (adres, telefon, çalışma saatleri) sayfaya otomatik eklenir.

Fiyatlar **ŞUKOB** (Şanlıurfa Kuyumcular Odası) fiyat servisinden sunucu üzerinden çekilir, sayfada 10 saniyede bir yenilenir (ŞUKOB en fazla ~20 sn geriden takip edilir). Altın, sarrafiye ve gümüş ŞUKOB listesindeki gibi kuruşsuz, döviz 2 haneyle (48,81) gösterilir.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Sayfanın kendisi. |
| `api/ayarlar.php` | **Fiyat ayarları:** gösterilecek ürünler ve adları, kâr marjı (%), önbellek süresi. |
| `api/fiyatlar.php` | Fiyat uç noktası. ŞUKOB'u sunucuda çağırır, sadeleştirir, önbellekte tutar. |
| `js/ayarlar.js` | **Site ayarları:** telefon, adres, WhatsApp, Instagram, çalışma saatleri, üstte öne çıkan fiyatlar, yenileme süresi. |
| `js/fiyat-tablosu.js`, `css/fiyat-tablosu.css` | Fiyat tablosu bileşeni. Başka sayfalarda da kullanılabilir (aşağıya bakın). |
| `css/site.css` | Renkler ve görünüm. İki temanın renkleri dosyanın en başında. |
| `js/site.js` | Sitenin çalışma mantığı (dokunmanıza gerek yok). |
| `fontlar/`, `css/fontlar.css` | Yazı tipleri. Google'a bağlanmadan kendi sunucunuzdan yüklenir. |
| `img/`, `site.webmanifest` | İkonlar, paylaşım görseli, "Ana ekrana ekle" ayarları. |

## Yayına alma

1. **PHP destekli** bir hosting alın (Türkiye'deki standart cPanel/Plesk hostinglerin hepsi olur). PHP 7.4 veya üstü, cURL açık.
2. Bu klasörün içindekileri hostingin `public_html` klasörüne yükleyin.
3. Tarayıcıda `siteniz.com/api/fiyatlar.php?tani=1` adresini açın:
   - `"basarili": true` ise bağlantı çalışıyor.
   - `"cloudflare_engeli": true` ise ŞUKOB sunucunuzu engelliyor. Bu engeli aşmaya çalışmayın; ŞUKOB ile görüşüp sunucu IP adresiniz için izin isteyin.
   - `ayarlarda_olup_kaynakta_olmayan` listesi, ayarlardaki ama ŞUKOB'da bulunmayan ürün kodlarını gösterir.
4. Her şey tamamsa `api/ayarlar.php` içindeki `tani_acik` değerini `false` yapın.
5. `index.html` içinde `www.example.com` yazan yeri kendi alan adınızla değiştirin (WhatsApp önizleme görseli buna bağlı).

Not: GitHub Pages gibi yalnızca düz HTML barındıran yerlerde PHP çalışmaz; fiyatlar gelmez. Netlify için aşağıdaki bölüme bakın.

## Fiyat ayarları (`api/ayarlar.php`)

- **`urunler`**: Gösterilecek ürün kodları, bu sırayla. `'kod' => 'Görünen ad'`. Ad yerine `null` yazılırsa ŞUKOB'daki ad kullanılır. Satırı silen ürün sitede görünmez.
  Kodlar: `HAS, 22_ayar_bilezik, hurda, yeni_ceyrek, yeni_yarim, yeni_ziynet, eski_ceyrek, eski_yarim, eski_ziynet, cnc, sarnel, GMS, USD, EUR`
- **`kar_marji_yuzde`**: Satış fiyatlarına eklenecek yüzde. Varsayılan `0`.
- **`onbellek_sn`**: ŞUKOB'a en fazla kaç saniyede bir gidileceği. Varsayılan `10` (en az `10`).
- **`engel_bekleme_sn`**: Cloudflare engeli (403/429/503 ya da JSON yerine HTML) görülünce kaynağın hiç denenmeyeceği süre. Varsayılan `600` (10 dakika). Bu sürede son başarılı veri gösterilir; engel aşılmaya çalışılmaz.

Ekranda kaç hane gösterileceği ve sayfanın yenilenme süresi `js/ayarlar.js` içindeki `FIYAT_TABLOSU` bölümündedir (`ondalik`, `yenilemeSaniye`). Kuruşsuz gösterilen altın ve gümüşte kuruş ŞUKOB'daki gibi kesilir, döviz yuvarlanır; hesaplama aracı da ekranda görünen fiyatı kullanır.

Uç nokta: `api/fiyatlar.php` (Apache/LiteSpeed'de `api/fiyatlar` de çalışır). Çıktı:

```json
[{"ad":"Has Altın","kod":"HAS","alis":6659.77,"satis":6702.24,"guncelleme":"2026-09-24T20:58:11+03:00"}]
```

ŞUKOB'a ulaşılamazsa ya da bozuk veri gelirse son başarılı veri döner (`X-Fiyat-Durumu: bayat` başlığıyla). Sayfada "kaynağa şu an ulaşılamıyor" notu ve verinin saati görünür. Hiç veri yoksa uç nokta `502 {"hata":"Fiyatlar alınamadı"}` döner, sayfada "Fiyatlar şu an alınamıyor" yazar. Son hatanın sebebi `api/onbellek/son-hata.json` dosyasına yazılır.

**Güncel olmayan veri uyarısı:** Tablonun üstünde belirgin bir uyarı kutusu çıkar: (1) ŞUKOB'a ulaşılamıyor ve son bilinen fiyat gösteriliyorsa, (2) ŞUKOB cevap verse bile fiyatlar `eskiUyariDakika` (varsayılan 5, `js/ayarlar.js`) dakikadır değişmediyse. Üstteki rozet de "Güncel değil" / "Son bilinen fiyat" olur. Verinin yaşı ziyaretçinin saatinden değil, sunucudan (`X-Fiyat-Yasi` başlığı) hesaplanır.

## Fiyat tablosunu başka sayfada kullanma

```html
<link rel="stylesheet" href="css/fiyat-tablosu.css">

<div data-fiyat-tablosu></div>                                  <!-- tüm ürünler -->
<div data-fiyat-tablosu data-kodlar="USD,EUR"></div>            <!-- yalnızca bunlar -->
<div data-fiyat-tablosu data-baslik="Güncel fiyatlar"></div>    <!-- başlıklı -->
<div data-fiyat-tablosu data-gruplar="Altın:HAS,22_ayar_bilezik|Döviz:USD,EUR"></div>

<script src="js/fiyat-tablosu.js"></script>
```

Alt klasördeki bir sayfada adresi belirtin: `<script>window.FIYAT_TABLOSU = { adres: '/api/fiyatlar.php' };</script>` (bileşen dosyasından önce). Sayfada kaç tablo olursa olsun sunucuya tek istek gider.

## Site bilgilerini değiştirme

`js/ayarlar.js` dosyasını açın. İçindeki telefon, adres, WhatsApp numarası ve Instagram adı **örnek bilgilerdir**, kendi bilgilerinizle değiştirin.

## Bilgisayarda deneme

PHP kuruluysa klasörde şunu çalıştırın, sonra `http://localhost:8000` adresini açın:

```
php -S localhost:8000
```

## Bilinen risk

`sukobfiyat.com/api/prices/` ŞUKOB'un kendi sayfası için kullandığı iç adrestir, resmî ve açık bir API değildir. Haber verilmeden değişebilir ya da kapanabilir. Kalıcı kullanım için odadan izin alınması önerilir.

## Sahte kaynakla test

Kaynak adresi `SUKOB_URL` ortam değişkeniyle değiştirilebilir. Kodu değiştirmeden sahte bir sunucuyla test etmek için:

```
SUKOB_URL="http://127.0.0.1:8096/api/prices/" php -S 127.0.0.1:8095
```

## Netlify'da yayınlama

Netlify PHP çalıştırmaz; fiyat uç noktasının Netlify sürümü `netlify/functions/fiyatlar.mjs` dosyasındadır ve `/api/fiyatlar.php` adresine yanıt verir (ön yüzde değişiklik gerekmez).

1. Netlify'da **Add new site → Import an existing project → GitHub** ile bu depoyu seçin.
2. **Branch:** kodun bulunduğu dal. **Base directory:** `sevilen-kuyumculuk`. Build command boş kalsın (`netlify.toml` gerisini ayarlar).
3. **Deploy**'a basın. Sürükle-bırak (Netlify Drop) ile yüklemeyin: fonksiyonlar o yolla çalışmaz.
4. Yayınlanınca `siteniz.netlify.app/api/tani` adresini açın:
   - `"basarili": true` ise fiyatlar geliyor.
   - `"cloudflare_engeli": true` ise ŞUKOB, Netlify sunucularını engelliyor demektir. Aşmaya çalışmayın; Türkiye'deki bir PHP hostinge geçin.
5. Kurulum bitince `netlify/ayarlar.mjs` içindeki `taniAcik` değerini `false` yapın.

Netlify'da ayarlar `netlify/ayarlar.mjs` dosyasındadır (ürünler, kâr marjı, önbellek süresi). Önbelleği Netlify CDN'i tutar; ŞUKOB'a en fazla `onbellekSn` saniyede bir gidilir. Son başarılı veri Netlify Blobs'ta saklanır. Ücretsiz planın aylık kullanım sınırı vardır; yoğun trafikte `onbellekSn` değerini 30'a çıkarmak çağrı sayısını üçte birine indirir.
