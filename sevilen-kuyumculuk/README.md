# Sevilen Kuyumculuk — Web Sitesi

Tek sayfalık site: canlı altın, sarrafiye, döviz ve gümüş fiyatları (alış / satış), altın hesaplama aracı, hakkımızda, iletişim + harita ve WhatsApp düğmesi.

- **İki tema:** Fildişi (varsayılan) ve koyu zümrüt. Ziyaretçi üst çubuktaki ay/güneş düğmesiyle değiştirir, seçimi tarayıcısında hatırlanır.
- **Telefonda:** açılır menü ve "Ana ekrana ekle" ikonu var. Müşteri fiyat sayfasını uygulama gibi ekranına ekleyebilir.
- **Paylaşım:** Site linki WhatsApp'ta paylaşılınca logolu önizleme görseli çıkar. Google için işletme bilgisi (adres, telefon, çalışma saatleri) sayfaya otomatik eklenir.

Fiyatlar **ŞUKOB** (Şanlıurfa Kuyumcular Odası) fiyat servisinden sunucu üzerinden çekilir, sayfada 15 saniyede bir yenilenir. Altın ve sarrafiye ŞUKOB listesindeki gibi kuruşsuz, gümüş 2, döviz 3 haneyle gösterilir.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Sayfanın kendisi. Hakkımızda metni burada. |
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

Not: GitHub Pages ya da Netlify gibi yalnızca düz HTML barındıran yerlerde PHP çalışmaz. Site açılır ama fiyatlar gelmez.

## Fiyat ayarları (`api/ayarlar.php`)

- **`urunler`**: Gösterilecek ürün kodları, bu sırayla. `'kod' => 'Görünen ad'`. Ad yerine `null` yazılırsa ŞUKOB'daki ad kullanılır. Satırı silen ürün sitede görünmez.
  Kodlar: `HAS, 22_ayar_bilezik, hurda, yeni_ceyrek, yeni_yarim, yeni_ziynet, eski_ceyrek, eski_yarim, eski_ziynet, cnc, sarnel, GMS, USD, EUR`
- **`kar_marji_yuzde`**: Satış fiyatlarına eklenecek yüzde. Varsayılan `0`.
- **`onbellek_sn`**: ŞUKOB'a en fazla kaç saniyede bir gidileceği. Varsayılan `10` (ŞUKOB fiyatları da yaklaşık 10 saniyede bir güncelliyor).

Ekranda kaç hane gösterileceği ve sayfanın yenilenme süresi `js/ayarlar.js` içindeki `FIYAT_TABLOSU` bölümündedir (`ondalik`, `yenilemeSaniye`). Fazla haneler yuvarlanmaz, ŞUKOB'daki gibi kesilir; hesaplama aracı da ekranda görünen fiyatı kullanır.

Uç nokta: `api/fiyatlar.php` (Apache/LiteSpeed'de `api/fiyatlar` de çalışır). Çıktı:

```json
[{"ad":"Has Altın","kod":"HAS","alis":6659.77,"satis":6702.24,"guncelleme":"2026-09-24T20:58:11+03:00"}]
```

ŞUKOB'a ulaşılamazsa ya da bozuk veri gelirse son başarılı veri döner (`X-Fiyat-Durumu: bayat` başlığıyla). Sayfada "kaynağa şu an ulaşılamıyor" notu ve verinin saati görünür. Hiç veri yoksa uç nokta `502 {"hata":"Fiyatlar alınamadı"}` döner, sayfada "Fiyatlar şu an alınamıyor" yazar. Son hatanın sebebi `api/onbellek/son-hata.json` dosyasına yazılır.

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

`js/ayarlar.js` dosyasını açın. İçindeki telefon, adres, WhatsApp numarası ve Instagram adı **örnek bilgilerdir**, kendi bilgilerinizle değiştirin. Hakkımızda yazısı `index.html` içinde, `ÖRNEK METİN` notunun altındadır.

## Bilgisayarda deneme

PHP kuruluysa klasörde şunu çalıştırın, sonra `http://localhost:8000` adresini açın:

```
php -S localhost:8000
```
