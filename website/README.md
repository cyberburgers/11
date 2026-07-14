# Boreas Air — Sondaj Hava Sistemleri Web Sitesi

Sondaj kule hava servisi / booster firması için iki dilli (TR + EN), SEO odaklı,
bağımlılıksız statik web sitesi. Tasarım dili
[artificialanalysis.ai](https://artificialanalysis.ai) ilkelerinden esinlenmiştir:
aydınlık yüzeyler, yoğun ama sakin veri tabloları, ölçülü vurgu rengi, bol beyaz alan.

## Yapı

```
website/
├── index.html                  # TR ana sayfa
├── filo.html                   # Ekipman filosu + teknik tablolar + karşılaştırma grafikleri
├── hakkimizda.html
├── iletisim.html               # Teklif formu (mailto ile çalışır, backend gerektirmez)
├── 404.html
├── hizmetler/
│   ├── booster-kiralama.html
│   ├── saha-operasyonlari.html
│   ├── kompresor-servisi.html
│   └── yedek-parca.html
├── blog/                       # 5 Türkçe teknik yazı + dizin
├── en/                         # İngilizce site (ana sayfa, 4 hizmet, filo, hakkında, iletişim, blog + 2 yazı)
├── assets/css/style.css        # Tüm tasarım sistemi (tek dosya)
├── assets/js/main.js           # Menü, SSS, grafik çubukları, form (bağımlılık yok)
├── sitemap.xml
└── robots.txt
```

## SEO altyapısı

- Her sayfada özgün `<title>` + `meta description` + canonical + Open Graph
- TR/EN `hreflang` alternates (sayfa bazında eşleştirilmiş)
- JSON-LD: `Organization`, `WebSite`, `Service`, `BlogPosting`, `FAQPage`, `BreadcrumbList`, `ContactPage`
- `sitemap.xml` + `robots.txt`
- Semantik HTML, tek `h1`, breadcrumb'lar, hızlı yükleme (harici font/JS kütüphanesi yok)

## Yayınlamadan önce değiştirilecekler (YER TUTUCULAR)

| Ne | Nerede | Şu anki değer |
|---|---|---|
| Şirket adı | tüm sayfalar ("Boreas Air") | örnek marka — kendi adınızla değiştirin |
| Alan adı | tüm `canonical`, `hreflang`, `sitemap.xml`, `robots.txt` | `https://www.boreasair.com` |
| Telefonlar | header/footer/iletişim | `+90 312 000 00 00` vb. |
| E-postalar | iletişim, form, footer | `info@boreasair.com`, `parca@boreasair.com` |
| Adres | footer + iletişim + JSON-LD | İvedik OSB örnek adresi |
| İstatistikler | ana sayfa/hakkımızda (20+ yıl, 40+ ünite, 350+ kuyu, %98) | gerçek rakamlarınızla güncelleyin |
| Filo tabloları | `filo.html`, `en/fleet.html` | örnek ünite listesi — kendi filonuzla eşleştirin |

Toplu değiştirme örneği:

```bash
grep -rl "boreasair.com" website/ | xargs sed -i 's/www.boreasair.com/www.SIZINALANADINIZ.com/g'
```

## Yayınlama

Tamamen statik — her sunucuda çalışır:

- **GitHub Pages:** Settings → Pages → bu klasörü kök yapın (veya repo kökü `website/` içeriğiyle ayrı branch)
- **Netlify / Vercel / Cloudflare Pages:** yayın dizini olarak `website/` gösterin
- Klasik hosting: `website/` içeriğini FTP ile kök dizine atın

Form gönderimi `mailto:` ile çalışır; gerçek form backend'i isterseniz
`iletisim.html` / `en/contact.html` içindeki formu Formspree, Netlify Forms
veya kendi endpoint'inize bağlayın (`assets/js/main.js` içindeki submit handler'ı kaldırın).
