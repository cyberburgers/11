# Hidayet Sondaj — SEO Rehberi ("urfa" aramasında üst sıralara çıkma)

## Sorun neydi?

Site **"Şanlıurfa sondaj"** aramasında 1. sırada çıkıyor ama **"urfa sondaj"**
aramasında çıkmıyor. Sebebi basit: Google için **"Şanlıurfa" ve "urfa" ayrı
kelimelerdir**. Sitenizde her yerde sadece "Şanlıurfa" yazıyorsa, Google sizi
"urfa" aramasıyla eşleştirmekte zorlanır. Çözüm: **"Urfa" kelimesini** başlıkta,
açıklamada, H1'de ve metinlerde **doğal şekilde** kullanmak.

> Not: Bu sandbox ortamının ağ politikası hidayetsondaj.com'a erişimi
> engellediği için sitenizin mevcut kodunu çekemedim. Bu klasördeki dosyalar,
> sitenize doğrudan uygulayabileceğiniz hazır bir SEO paketi olarak hazırlandı.

## Bu klasördeki dosyalar

| Dosya | Ne işe yarar |
|---|---|
| `index.html` | "Urfa + Şanlıurfa + komşu iller" için tam optimize edilmiş, mobil uyumlu hazır anasayfa |
| `sitemap.xml` | Google'a site haritası bildirimi |
| `robots.txt` | Arama motoru botlarına izin dosyası |

## Yapmanız gerekenler (öncelik sırasıyla)

### 1. Telefon ve adresi doldurun
`index.html` içinde `TODO` ile işaretli 4 yer var: telefon numarası (3 yerde),
açık adres ve JSON-LD içindeki `telephone`. Bunları gerçek bilgilerinizle
değiştirin. Koordinatlar (`latitude/longitude`) şu an Şanlıurfa merkezi;
işyerinizin gerçek konumunu Google Haritalar'dan alıp yazın.

### 2. Dosyaları sitenize yükleyin
- Siteniz hazır bir panelden (Wix, WordPress, hosting paneli vb.) yönetiliyorsa
  `index.html`'i olduğu gibi yüklemek yerine içindeki şu parçaları mevcut
  sitenize taşıyın:
  - `<title>` etiketi → sitenizin başlığı yapın:
    `Urfa Sondaj | Şanlıurfa Su Sondajı ve Su Kuyusu Açma - Hidayet Sondaj`
  - `<meta name="description">` → site açıklaması yapın
  - İki `<script type="application/ld+json">` bloğu → sayfanın `<head>` kısmına ekleyin
  - H1 başlığı → anasayfanızın ana başlığı yapın
  - "Hizmet Verdiğimiz Bölgeler" bölümü → anasayfanıza bir bölüm olarak ekleyin
- Siteniz düz HTML ise `index.html`, `robots.txt` ve `sitemap.xml`'i doğrudan
  sitenin kök klasörüne atabilirsiniz.

### 3. Google Business Profile (en etkili adım!)
"urfa sondaj" gibi yerel aramalarda ilk çıkanlar **harita kayıtlarıdır**.
1. https://business.google.com adresinden ücretsiz kayıt olun.
2. İşletme adı: **Hidayet Sondaj** — açıklamaya "Urfa" ve "Şanlıurfa"nın
   ikisini de yazın.
3. Kategori: "Sondaj firması" / "Su kuyusu sondaj hizmeti".
4. Hizmet bölgesi olarak Şanlıurfa'nın tüm ilçelerini + Gaziantep, Adıyaman,
   Diyarbakır, Mardin'i ekleyin.
5. Müşterilerinizden Google'da yorum yazmalarını isteyin — yorumlarda "Urfa"
   kelimesi geçtikçe sıralamanız güçlenir.

### 4. Google Search Console
1. https://search.google.com/search-console adresinden sitenizi doğrulayın.
2. `sitemap.xml`'i gönderin.
3. "URL denetimi" ile anasayfanın yeniden dizine eklenmesini isteyin —
   değişikliklerin Google'a yansıması böylece hızlanır.

### 5. Komşu iller için (isteğe bağlı ama güçlü)
"gaziantep sondaj", "adıyaman sondaj" gibi aramalarda da çıkmak isterseniz
her il için ayrı bir sayfa açın (`/gaziantep-sondaj`, `/adiyaman-sondaj`,
`/diyarbakir-sondaj`, `/mardin-sondaj`). Her sayfada:
- Başlık: `Gaziantep Sondaj | Su Sondajı ve Su Kuyusu - Hidayet Sondaj` gibi
- O ile özel 2-3 paragraf özgün metin (aynı metni kopyalamayın — Google
  kopya içeriği cezalandırır)
- Bu sayfaları `sitemap.xml`'e ekleyin.

## Hedeflenen anahtar kelimeler

**Ana:** urfa sondaj, urfa su sondajı, urfa su kuyusu, urfa sondaj firması,
şanlıurfa sondaj, şanlıurfa su sondajı

**İlçe:** siverek sondaj, viranşehir sondaj, akçakale sondaj, harran sondaj,
birecik sondaj, suruç sondaj, hilvan sondaj, bozova sondaj, ceylanpınar sondaj

**Komşu il:** gaziantep sondaj, adıyaman sondaj, diyarbakır sondaj, mardin sondaj

**Hizmet:** su kuyusu açma, derin kuyu sondajı, tarımsal sulama sondajı,
dalgıç pompa montajı, kuyu temizleme

## Beklenti yönetimi

Değişikliklerin Google'a yansıması genelde **2-6 hafta** sürer. En hızlı
sonucu Google Business Profile kaydı verir (birkaç gün içinde haritada
görünürsünüz). "urfa" gibi kısa ve rekabetli kelimede 1. sıra garantisi kimse
veremez, ama bu adımlar sizi teknik olarak yapılabilecek en iyi konuma getirir.
