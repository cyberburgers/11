# Sevilen Kuyumculuk — Web Sitesi

Tek sayfalık site: canlı altın, sarrafiye, döviz ve gümüş fiyatları (alış / satış), altın hesaplama aracı, hakkımızda, iletişim + harita ve WhatsApp düğmesi.

Fiyatlar **ŞUKOB** (Şanlıurfa Kuyumcular Odası) tavsiye fiyat listesinden otomatik çekilir, 30 saniyede bir yenilenir.

## Dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | Sayfanın kendisi. Hakkımızda metni burada. |
| `js/ayarlar.js` | **Değiştireceğiniz tek dosya:** telefon, adres, WhatsApp, Instagram, çalışma saatleri, fiyat listesi, kâr payı. |
| `css/site.css` | Renkler ve görünüm. |
| `js/site.js` | Sitenin çalışma mantığı (dokunmanıza gerek yok). |
| `api/fiyatlar.php` | ŞUKOB fiyatlarını sunucuda okuyup siteye veren köprü. |

## Yayına alma

1. **PHP destekli** bir hosting alın (Türkiye'deki standart cPanel/Plesk hostinglerin hepsi olur). PHP 7.4 veya üstü yeterli.
2. Bu klasörün içindekileri hostingin `public_html` klasörüne yükleyin.
3. Tarayıcıda `siteniz.com/api/fiyatlar.php?tani=1` adresini açın. Burada:
   - `"ulasildi": true` ve `okunan_kalemler` listesi doluysa bağlantı çalışıyor demektir.
   - Liste boşsa, bu sayfanın çıktısını geliştiriciye iletin (aşağıya bakın).
4. Her şey tamamsa `api/fiyatlar.php` içindeki `TANI_ACIK` değerini `false` yapın.

Not: GitHub Pages ya da Netlify gibi yalnızca düz HTML barındıran yerlerde PHP çalışmaz. Site açılır ama fiyatlar gelmez.

## Bilgileri değiştirme

`js/ayarlar.js` dosyasını açın. İçindeki telefon, adres, WhatsApp numarası ve Instagram adı **örnek bilgilerdir**, kendi bilgilerinizle değiştirin. Hakkımızda yazısı `index.html` içinde, `ÖRNEK METİN` notunun altındadır.

**Kâr payı:** ŞUKOB zaten kuyumcular için tavsiye fiyatı verdiği için varsayılan olarak fark eklenmez. İsterseniz her kaleme `alisFark` / `satisFark` (TL) ekleyebilirsiniz:

```js
{ id: 'ceyrek', ad: 'Çeyrek', ..., satisFark: 50 }   // çeyrek satışını 50 TL artırır
```

## ŞUKOB bağlantısı hakkında önemli not

`api/fiyatlar.php`, ŞUKOB sayfasındaki fiyat tablosunu okuyacak şekilde yazıldı. Ancak site hazırlanırken ŞUKOB sayfasının iç yapısı görülemedi. Okuyucu yaygın tablo ve liste yapılarıyla test edildi; yine de gerçek sayfada ilk kurulumda `?tani=1` ile kontrol edilmesi gerekir.

- ŞUKOB fiyatları sayfaya JavaScript ile sonradan yüklüyorsa, `?tani=1` çıktısındaki `sayfadaki_adresler` listesinde asıl veri adresi görünür. `KAYNAK_URL` o adresle değiştirilir.
- En sağlam yol: ŞUKOB'dan üyeler için resmî bir veri bağlantısı (API) olup olmadığını sorun. Varsa onu kullanmak, sayfa okumaktan daha güvenilirdir.
- ŞUKOB'a ulaşılamazsa site son alınan fiyatları **"Son bilinen fiyat"** etiketiyle gösterir (en fazla 6 saat). Daha eskiyse fiyat göstermez ve müşteriye aramasını söyler. Yayındaki sitede hiçbir zaman örnek/sahte fiyat gösterilmez.

## Bilgisayarda deneme

PHP kuruluysa klasörde şunu çalıştırın, sonra `http://localhost:8000` adresini açın:

```
php -S localhost:8000
```

ŞUKOB'a ulaşılamazsa sayfa bilgisayarınızda **örnek fiyatlarla** açılır. Bu durum sayfadaki sarı uyarıyla belirtilir.
