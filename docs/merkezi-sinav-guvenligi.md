# Merkezi Sınav Güvenliği — Saha El Kitabı ve Tehdit Analizi

**Kimin için:** Sınav bürosu personeli, bina sınav sorumluları, salon başkanları, gözetmenler ve güvenlik irtibat görevlileri.

**Ne için:** Kontrolü tasarlamak ve ihlali tespit etmek için. Bu metin ihlal tarifi değildir; hangi kontrolün neyi yakaladığını, neyi yakalamadığını ve sahada ne yapılacağını anlatır.

**Kaynak sınıfı etiketleri:** Metin boyunca iddiaların yanında bulacaksınız.
`[D]` doğrulanmış (mevzuat, resmî açıklama, adli vaka) · `[B]` basına yansıyan anlatı, resmî teknik parametre değil · `[T]` sektör bilgisi / çıkarım.

Bu ayrımı yapmayan güvenlik metinleri personeli yanlış güvene sokar. Aşağıdaki bölümlerin yarısı, dolaşımdaki "bilinen doğruları" düzeltmekle geçiyor.

---

## 0. Yönetici özeti — okumaya vaktiniz yoksa bu on madde

1. **Düzenekler çalışıyor.** "Nasılsa görüntü bozuk çıkar, ses duyulmaz, cihaz ısınır" varsayımı yanlış ve tehlikeli. Nisan 2026'da Sakarya merkezli tek bir operasyonda 208 kamera düzeneği, 63 kulak içi kulaklık, 120 batarya ve 14 wifi cihazı ele geçirildi; örgütün cirosu 10 milyon lira olarak açıklandı `[D]`. Çalışmayan bir üründe bu hacimde pazar oluşmaz.
2. **Yakalanma sebebi cihazın bozulması değil.** Sahadaki yakalamalar üç kaynaktan geliyor: davranış (gözetmen), istihbarat (kolluk), istatistik (sınav sonrası analiz). Cihazın teknik yetersizliği bunların arasında yok.
3. **En zayıf halka kapı değil, kapıdan sonrası.** Isparta 2024 vakasında düzenek ayakkabı astarına gizlenerek girişten geçti, aday **tuvalette** cihazı çıkarıp vücuduna monte etti `[D]`. Kurumlar en çok kapıya yatırım yapıyor, en az montaj aşamasına.
4. **Tehdit büyük sınavlardan küçük sınavlara kaydı.** YKS ve KPSS pahalı hedef. Ehliyet (MTSK) e-sınavı, açık öğretim sınavları, kurum içi sınavlar ucuz hedef. 2026'daki organize kopya operasyonlarının hedefi ehliyet sınavlarıydı `[D]`.
5. **Bu artık bireysel bir hile değil, ticari bir suç ekonomisi.** Fiyat listesi var (düzenek başına yaklaşık 20 bin lira `[B]`), tedarik zinciri var, müşteri bulma kanalı var, para aklama ayağı var.
6. **Yapay zekâ iki ayrı yerde devrede:** soruyu çözmede (Isparta 2024) ve sahte biyometrik fotoğraf üretmede (Mardin 2026 operasyonu) `[D]`. "Joker" yöntemi kapanmadı, pahalılaştı ve teknikleşti.
7. **İstatistik tek başına delil değildir.** Sınav sonrası benzerlik analizi idari iptalin dayanağıdır, ceza yargılamasının ise destekleyicisidir. Kesin sonuç, salon tutanağı ve kamera ile birleştiğinde çıkar.
8. **Kötü yazılmış tutanak, iyi yakalanmış suçüstünü çökertir.** Bölüm 10'daki iyi/kötü tutanak örneği bu belgenin en pratik parçasıdır.
9. **Yanlış pozitif gerçek bir risk.** İşitme cihazı, koklear implant, insülin pompası, metal protez, korse, tik bozukluğu, kaygı bozukluğu. Dedektör alarmı suçlama değildir; kayıt konusudur.
10. **Personel de tehdit yüzeyinin parçasıdır.** Tarihteki en büyük ihlaller salondan değil, içeriden çıktı. Bölüm 11'deki "görevlinin kendi riski" kısmını atlamayın.

---

## 1. Önce yanlışları düzeltelim: dolaşımdaki sekiz efsane

| Yaygın iddia | Gerçekte ne var | Neden önemli |
| --- | --- | --- |
| "Kapalı dönemde çöpler özel fırınlarda yakılır." | Müsvedde kâğıtlar ve hatalı basılmış kitapçıklar **öğütülerek toz haline getirilir**; öğütülen kâğıt bile sınav bitmeden binadan çıkarılmaz `[D]`. Yöntem yakma değil, öğütme + tecrit. | Süreci abartılı anlatmak, personelin kendi rutin evrak imhasını ciddiye almamasına yol açıyor. |
| "Kapalı dönem her sınavda 40-45 gündür." | Süre sınav türüne göre değişir; bazı sınavlarda 10 gün, YKS'de 45 güne kadar çıkar `[D]`. | Kısa kapalı dönemli sınavlar daha yüksek riskli. Risk sınıflandırması buna göre yapılmalı. |
| "Nakil aracı rotasından 50 metre saparsa merkezde alarm çalar." | Nakil araçlarının takip edildiği ve refakat edildiği doğru `[D]`; ancak "50 metre" gibi kesin bir eşik resmî bir teknik parametre olarak yayımlanmış değil `[B]`. | Sahadaki görevlinin işi GPS değil, **mühür ve tutanak**. Mühür bozuksa kutu açılmaz, merkeze bildirilir. |
| "Mikro kamera odaklanamaz, kulak mıknatısı duyulmaz, cihaz ısınıp adayı bozar — nasılsa çalışmaz." | Ele geçirilen düzenekler çalışır durumda ve seri üretiliyor `[D]`. Bu efsanenin kaynağı, ilk nesil ucuz setlerin performansı. | Bu, listedeki **en tehlikeli** efsane. Gözetmeni rahatlatır ve dikkat eşiğini düşürür. |
| "Dedektörden geçen aday temizdir." | Dedektör metal kütlesi arar ve tek katmandır. Isparta vakasında düzenek girişten sonra monte edildi `[D]`. eSIM'li cihazlarda aranacak fiziksel SIM yuvası bile yok `[T]`. | Kapı, savunmanın tamamı değil, ilk katmanı. Kapı sonrası kontrol olmadan kapı tek başına anlamsız. |
| "İstatistik nasılsa yakalar, salonda uğraşmaya gerek yok." | Benzerlik analizi **cevap örüntüsü paylaşımını** yakalar. Dışarıdan tek adaya gelen, doğru çözülmüş cevabın örüntü ortağı yoktur; zayıf sinyal verir. 2010 KPSS'yi de önce algoritma değil ihbar açığa çıkardı `[D]`. | Salon gözetimi, istatistiğin göremediği tam da bu boşluğu kapatıyor. |
| "Ceza ağır, kimse göze alamaz." | 1 yıldan 4 yıla kadar hapis ve 2 yıl sınav yasağı var `[D]` — buna rağmen milyonluk bir pazar oluşmuş durumda. | Caydırıcılık ceza ağırlığından çok **yakalanma olasılığından** gelir. Yakalanma olasılığını üreten şey sizin gözetiminizdir. |
| "Biyometrik doğrulama gelince joker bitti." | Zorlaştı, bitmedi. Mardin merkezli 5 ilde yapılan 2026 operasyonunda yapay zekâ ile üretilmiş sahte biyometrik fotoğraflar kullanıldığı bildirildi `[D]`. | Başvuru aşamasındaki otomatik kontrol tek başına yetmiyor; salondaki insan teyidi hâlâ kritik. |

---

## 2. Tehdit modeli: kim, neden, ne kadar parayla

Savunma tasarlarken "kopyacı" diye tek bir profil düşünmek en sık yapılan hata. Sahada en az altı farklı aktör var ve her biri farklı kontrolle kırılıyor.

| Aktör | Amacı | Bütçesi | Tipik yöntemi | Onu kıran kontrol |
| --- | --- | --- | --- | --- |
| **Fırsatçı aday** | Anlık puan | Sıfır | Yan sıraya bakma, kâğıt, telefonu unutmuş görünmek | Salon gözetimi, oturma düzeni, kitapçık türü çeşitliliği |
| **Donanımlı bireysel aday** | Belirli bir puanı garantilemek | Orta-yüksek | Kamera + kulaklık + veri bağlantısı, dışarıda çözücü veya yapay zekâ | Davranış gözlemi, kapı + kapı sonrası arama, ihbar |
| **Ticari sağlayıcı (çete)** | Para | Yüksek, döner sermaye | Düzenek satar, kurar, dışarıdan ekip sağlar; seri müşteri | Kolluk istihbaratı, suçüstü, mali takip |
| **Joker ağı** | Başkasının yerine sınava girmek | Orta-yüksek | Kimlik ve biyometri manipülasyonu, sahte/işlenmiş fotoğraf | Biyometrik doğrulama + **salonda insan teyidi** |
| **İçeriden aktör** | Soru, cevap anahtarı, evrak sızıntısı | Değişken | Yetkili erişimi kötüye kullanma | Kapalı dönem, görev ayrılığı, erişim logu, çıkar çatışması beyanı |
| **Sipariş üzerine hedefli sızıntı** | Belirli kişileri geçirmek | Çok yüksek | Ayrıcalıklı erişim + örgütlü dağıtım | Ayrıcalıklı hesap denetimi, iki kişi kuralı, sonradan analiz |

**Ekonomiyi anlamak neden gerekli:** Bir düzeneğin sahada yaklaşık 20 bin liraya satıldığı, tek örgütün 10 milyon lira ciro yaptığı bir ortamda, ihlal girişimi "birkaç meraklı genç" değil, arz-talebi olan bir sektördür. Sektörler kâr marjı düşen pazarı bırakır. Sizin işiniz, sorumlu olduğunuz binada yakalanma olasılığını marjı yiyecek kadar yükseltmek.

---

## 3. İhlal zinciri ve gerçek kırılma noktaları

Her ihlal girişimi yedi aşamadan geçer. Bir aşamayı kırmak yeter — ama hangi aşamaya ne kadar yatırım yaptığınız sonucu belirler.

| # | Aşama | Saldıran tarafın işi | Kurumun kontrolü | Gerçekte ne oluyor |
| --- | --- | --- | --- | --- |
| 1 | **Keşif** | Hangi bina, hangi salon, kontrol seviyesi nedir | Bina/salon atamasının geç açıklanması, görevli atamasının kurayla ve geç yapılması | Genelde iyi korunuyor |
| 2 | **Tedarik** | Donanım alma, çözücü ekip kurma | Kolluk istihbaratı, e-ticaret ve iletişim takibi | 2026 operasyonlarında en verimli aşama çıktı |
| 3 | **Giriş** | Cihazı binaya sokmak | Dedektör, üst araması, dış kontrol noktaları | **En çok yatırım yapılan aşama** |
| 4 | **Montaj** | Cihazı vücuda takmak, kulaklığı yerleştirmek | Tuvalet ve koridor kontrolü, giriş sonrası refakat, salona giriş anında ikinci bakış | **En az yatırım yapılan aşama — ve saha vakalarının kırıldığı yer** |
| 5 | **İletim** | Soruyu dışarı, cevabı içeri taşımak | Sinyal tedbirleri, salon içi gözetim, davranış | Kısmi |
| 6 | **Kullanım** | Cevabı kodlamak | Gözetmen, kamera, cevap örüntüsü analizi | Sınav sonrası güçlü |
| 7 | **Çıkış ve aklama** | Düzeneği yok etmek, parayı aklamak | Bina çıkışı, adli soruşturma, mali takip | Uzun vadeli |

**Bu tablonun tek cümlelik özeti:** Kaynak dağılımı ile risk dağılımı uyuşmuyor. Bir binada iyileştirme yapacaksanız, üçüncü dedektörü almadan önce **tuvalet kontrol prosedürünüzü** yazın.

---

## 4. Birinci katman — Kaynak, basım ve nakil

### 4.1 Kapalı dönem gerçekten ne yapıyor

ÖSYM'nin soru hazırlama ve basım merkezinde uygulanan tedbirler, kamuya açıklanan hâliyle şunlar `[D]`:

* **Fiziksel ve elektromanyetik tecrit:** Faraday kafesi, sinyal kesiciler, kabloların TEMPEST filtrelemesinden geçirilmesi. Amaç, binadan hem kablosuz hem de kablo üzerinden sızıntıyı imkânsıza yaklaştırmak.
* **Süre:** Sınav türüne göre 10 günden 45 güne kadar. Kapalı dönem boyunca komisyon ve matbaa personeli dışarı çıkmıyor.
* **Erişim kısıtı:** Kapalı dönem alanına yalnızca Başkan, görevlendirdiği Başkan Yardımcısı ve kapalı dönem personeli girebiliyor. Girişte arama yapılıyor, teknolojik cihazla giriş yok.
* **Atık kontrolü:** Müsvedde ve hatalı kitapçıklar öğütülerek toz haline getiriliyor; sınav bitmeden dışarı çıkarılmıyor.
* **Kayıt:** Süreç 7/24 kamera ile kayıt altında.

Bu mimari, bilgi güvenliğinde "hava boşluğu" (air gap) denilen yaklaşımın fiziksel dünyada uygulanmış hâli. Doğru tasarlanmış ve pahalı bir kontrol.

### 4.2 Ama kapalı dönemin kapatmadığı bir şey var: insan

Elektromanyetik yalıtım sinyali durdurur, insanı durdurmaz. Kapalı dönemin asıl işlevi sızıntıyı imkânsız kılmak değil, **sızdırabilecek kişi sayısını radikal biçimde azaltmak ve her birini izlenebilir kılmaktır.** Kontrolün adı budur: erişim yüzeyini küçültmek.

Bu yüzden ihlal riski soru havuzunun kendisinde değil, havuza dokunan **kişi listesinde** yoğunlaşır. Denetlenmesi gereken de budur: kim, ne zaman, hangi yetkiyle, hangi kaydı bırakarak eriştiği.

### 4.3 2010 KPSS'den çıkan gerçek ders

Yaygın anlatı, 2010 KPSS'nin "kapalı dönem öncesi dönemin bir kazası" olduğu ve sorunun yapısal olarak kapandığı yönünde. Bu, rahatlatıcı ama eksik bir okuma.

Doğrulanmış tablo şu `[D]`:

* Skandal ilk olarak bir sosyal medya grubunda ortaya çıktı — yani **tespit mekanizması kurumun kendi analitiği değildi.**
* KPSS tarihinde daha önce hiç görülmemiş biçimde, Eğitim Bilimleri testindeki 120 sorunun 120'sini doğru yapan **350 kişi** çıktı.
* Bu 350 kişinin 70'i karı-koca, 23'ü akraba, 52'si aynı adreste veya aynı apartman, site ya da sokakta oturuyordu.
* Sınav yenilendiğinde "şampiyon" sayısı 3.229'dan 76'ya düştü.
* Soruşturma 5 yıl sürdü; aralarında iki eski ÖSYM Başkanı'nın da bulunduğu 230 şüpheli hakkında iddianame düzenlendi.

**Ders 1:** Anomali tek başına yeterli değildi. İstatistik "bu imkânsız" dedi; delil değeri, sosyal ağ verisiyle (akrabalık, adres) birleşince oluştu.

**Ders 2:** İhbar, en güçlü tespit kanalıydı. Bugün de öyle — 2026 operasyonlarının çoğu istihbaratla başladı `[D]`.

**Ders 3:** Yapısal düzeltme yapıldı, ama "bir daha olmaz" cümlesi bir kontrol değil, bir temennidir. Kontrol, düzenli denetim ve ölçmedir.

### 4.4 Nakil ve evrak: sahadaki görevlinin sorumluluğu burada başlar

Merkezî tedbirler sizin kontrolünüzde değil. Sizin kontrolünüzdeki dört nokta şunlar:

1. **Mühür kontrolü.** Kutuyu açmadan önce mühre bakın. Mühür bozuk, gevşek, kesilmiş veya numarası tutanaktakiyle uyuşmuyorsa **kutuyu açmayın.** Merkeze bildirin, tutanak tutun, bekleyin. Açılmış bir kutuyu geri "kapatmak" mümkün değildir; o andan itibaren o sınavın bütünlüğü tartışmalıdır.
2. **Zaman disiplini.** Kutu, protokolde belirtilen saatten önce açılmaz. "Kalabalık olmasın diye erken açtık" cümlesi, savunulabilir bir gerekçe değildir.
3. **İki kişi kuralı.** Evrak asla tek kişinin elinde ve tek kişinin gözetiminde bulunmaz. Açma, sayma, dağıtma, toplama ve mühürleme aşamalarının her birinde en az iki görevli bulunur ve ikisi de tutanağı imzalar.
4. **Sayım.** Dağıtılan ve toplanan kitapçık/cevap kâğıdı sayısı birbirini tutmak zorundadır. Eksik bir kitapçık, sınav bitmeden çözülmesi gereken bir olaydır — "sonra bakarız" konusu değil.

---

## 5. İkinci katman — Bina ve salon

### 5.1 Kapı: darboğaz bir kader değil, bir planlama sorunudur

Kapıdaki temel gerilim şu: arama derinliği ile aday akışı ters orantılıdır.

Basit bir hesap. 800 adaylı bir binada 4 kontrol noktası varsa ve giriş penceresi 40 dakikaysa, nokta başına 200 aday ve 2.400 saniye düşer — teorik olarak aday başına 12 saniye. Ama adaylar düzgün dağılmaz; yüzde 60'ı son 15 dakikada gelir. Bu durumda son dilimde aday başına süre 3-5 saniyeye iner ve arama fiilen "geçir" komutuna dönüşür.

Bunu çözmenin yolu daha hızlı aramak değil, **kuyruğu düzleştirmek**:

* **Kapıyı erken açın.** Bina girişini sınav saatinden en az 90 dakika önce açmak, kuyruğu üç katına yayar. Adayın salonda oturması, kapıda beklemesinden hem güvenli hem hızlıdır.
* **Kademeli çağrı yapın.** Salon numarasına veya aday numarası aralığına göre giriş saati verin. Anonsla değil, sınav giriş belgesinde yazılı olarak.
* **Kontrol noktası sayısını aday sayısıyla ölçekleyin.** 800 aday için 4 nokta yetersizdir; bir nokta 100-150 adaydan fazlasını derinlemesine tarayamaz.
* **İkinci hat kurun.** Ana hat hızlı geçirir; alarm veren veya rastgele seçilen adaylar ayrı bir noktaya alınır. Kritik nokta: alarm veren aday **ana kuyruğu tıkamamalıdır**, yoksa görevli bir sonraki alarmda "geçir" refleksine girer.
* **Kadın görevli sayısını yeterli tutun.** Kadın adaylar için kadın görevli yoksa arama fiilen yapılamıyor demektir. Bu, en sık rastlanan ve en kolay çözülen boşluk.
* **Görevliyi rotasyona sokun.** Dikkat 40-50 dakikada belirgin düşer `[T]`. Kapıda 45 dakikada bir görevli değişimi, ekstra dedektörden daha çok işe yarar.

**Arama kontrol listesi** (kolluk personeliyle ortak çalışılacak alanlar):

Ayakkabı tabanı ve astarı · kemer tokası ve kemer içi · yaka ve manşet kalınlığı · iç giyim balenleri · saç tokası, bandana, peruk · gözlük çerçevesi ve sapları · kol saati, bileklik, yüzük · maske · su şişesi etiketi ve kapağı · peçete/mendil paketi · bandaj, atel, protez · kalem kutusu ve silgi (zaten yasak).

### 5.2 Kapıdan sonrası: sistemin gerçek kör noktası

Isparta 2024 vakası, bu belgedeki en öğretici olay. Doğrulanmış akış şu `[D]`:

> Aday, elektronik düzeneği ayakkabısının astarını sökerek gizledi ve bu şekilde giriş kontrolünden geçti. Binaya girdikten sonra **tuvalete gitti**, düzeneği çıkarıp vücuduna yerleştirdi ve kulağına kulaklığı taktı. Düğme kamerayla soruları çekip yapay zekâya gönderdi; cevaplar kredi kartı biçimli telefon üzerinden kulaklığa iletildi. İnternet bağlantısını ayakkabıya gizlenmiş bir router sağlıyordu. Polis, sınav sırasında adayın davranışlarından şüphelendi; aday ve bir yardımcısı gözaltına alındı, aday tutuklandı, hakkında 6114 sayılı Kanun kapsamında işlem yapıldı.

Bundan çıkan operasyonel sonuçlar:

**Tuvalet, binanın en kritik alanıdır.**

* Bina açılmadan **önce** süpürün: rezervuar içi, çöp kutusu, pencere pervazı, asma tavan paneli, sifon arkası, lavabo altı, kapı üstü. Bina açıldıktan sonra yapılan süpürmenin değeri düşüktür.
* Sınav sırasında tuvalete **tek tek** ve refakatli gönderin.
* Giriş-çıkış kaydı tutun: saat, salon, sıra no. Bu kayıt sonradan davada işe yarar.
* Sınavın **ilk 15 dakikasındaki** tuvalet talebi ayrı dikkat ister. Montaj penceresi burasıdır.

**Diğer kör noktalar:** koridor ve merdiven boşlukları, çöp kutuları, radyatör arkaları, pencere kenarları ve pervazlar, saksılar, panolar ve arkaları, sıra altları ve sıra içleri, önceki oturumdan kalan kâğıtlar. MEB'in açık öğretim sınav talimatlarında da salon, koridor, lavabo, çöp kutusu, pencere, sıra ve masaların sınav öncesi kontrolü açıkça isteniyor `[D]`.

### 5.3 Kimlik ve joker: otomatik kontrol yetmiyor

Biyometrik doğrulamanın başvuru aşamasına girmesi, klasik fotoğraf montajı yöntemini büyük ölçüde kapattı. Ancak Mardin merkezli 5 ilde 2026'da yapılan operasyonda, gizli kamera ve casus kulaklığın yanında **yapay zekâ ile üretilmiş sahte biyometrik fotoğraflar** kullanıldığı bildirildi `[D]`. Yani üretici taraf, doğrulama sistemine karşı kendi teknolojisini geliştirdi.

Salonda yapılacaklar:

* Fotoğraf karşılaştırmasını **ışıkta ve yüz açıkken** yapın. Ekrana şöyle bir bakmak kontrol değildir.
* Kimlik kartının çipini okutun; görsel kontrol tek başına yetersiz.
* İmza karşılaştırması yapın — hem giriş hem çıkış imzasında. Joker vakalarında en sık çöken nokta budur.
* Kırmızı bayraklar: fotoğrafla belirgin yaş uyumsuzluğu, adayın kendi adını duraksayarak söylemesi, kimliğin şüpheli derecede yeni görünmesi, salon listesindeki bilgilerle sözlü beyanın uyuşmaması, sınav sonunda el yazısının giriş imzasından farklılaşması.
* Şüphe halinde: adayı sınavdan çıkarmayın, salon başkanına ve bina sorumlusuna bildirin, kolluk teyidini isteyin, tutanak tutun. Kimlik şüphesi kolluk konusudur; gözetmenin karar vereceği bir konu değildir.

### 5.4 Salon içi gözetim: neyi, ne zaman izleyeceksiniz

Gözetim, salonun önünde oturup adayları izlemek değildir. Etkili gözetim üç şeye dayanır: hareket, açı ve zamanlama.

* **Ayakta ve hareketli olun.** Oturan gözetmen gözetmen değildir. Sıraların arasından geçin.
* **Arkadan yürüyün.** Adayın sizi görmediği açı, kulak-şakak-yaka hattını görebildiğiniz tek açıdır.
* **Düzensiz aralıklarla tur atın.** Sabit ritim öngörülebilirdir ve düzenek bu ritme göre kullanılır. 12-18 dakikalık rastgele aralıklar hedefleyin.
* **Bölge rotasyonu yapın.** İki gözetmen varsa bölgeleri periyodik olarak değiştirin; aynı bölgeye uzun süre bakan göz, alışır ve görmez olur.
* **Yoğunlaşma pencereleri:** İlk 20 dakika (düzeneğin devreye alındığı zaman) ve son 20 dakika (cevabın toplu kodlandığı zaman). Bu iki dilimde gözetim sıklığını artırın.

**Ne izleneceği:** kulak-şakak-yaka hattı, göğüs hizasında kâğıt tutuşu, ışığa göre konumlanma, gözlerin kitapçık yerine boşluğa odaklanması, gövdenin hiç hareket etmemesi, tuvalet talebinin zamanlaması, görevli yaklaşınca ritim değişikliği.

### 5.5 Yanlış pozitif: gözden kaçan ama en pahalı hata

Bir masum adayı yanlışlıkla "şüpheli" ilan etmek, gerçek bir ihlali kaçırmaktan daha görünür bir hatadır ve kuruma dava olarak geri döner.

Meşru açıklaması olan durumlar:

* **Tıbbi cihazlar:** işitme cihazı, koklear implant, insülin pompası, EKG holter, kalp pili, metal protez, atel, ortopedik korse. Bunlar dedektörü tetikler ve bazıları kulakta cihaz görüntüsü verir.
* **Nörolojik ve psikiyatrik durumlar:** tik bozuklukları, otizm spektrumu, kaygı bozukluğu, dikkat eksikliği. Bunlar "duruş anomalisi" ve "tekrarlayan hareket" olarak okunabilir.
* **Kültürel ve dini kıyafet.**
* **Basit fiziksel nedenler:** üşüme, boyun tutulması, sırt ağrısı, yeni ameliyat.

Doğru yaklaşım:

1. Sağlık raporlu aday ve cihaz listesini sınavdan önce alın, salon başkanına bildirin. Sürprizi sınav sabahına bırakmayın.
2. Alarm veren adayı suçlamayın; **kayıt altına alın** ve ikinci hatta yönlendirin.
3. Tutanağa **gözlem** yazın, **nitelendirme** yazmayın. "Kopya çekti" bir hukuki nitelendirmedir ve gözetmenin işi değildir. "Şu saatte şu hareketi yaptı" bir gözlemdir ve tam olarak sizin işinizdir.
4. Tek gösterge hiçbir şey ifade etmez. Bölüm 9'daki taban oranı uyarısını okuyun.

### 5.6 Sınav sonu ve evrak teslimi

* Cevap kâğıtları ve kitapçıklar salonda, adayların gözü önünde sayılır ve mühürlenir.
* Sayım tutmuyorsa salon terk edilmez.
* Salon sınav tutanağı **salonda ve olay anında** doldurulur. Sonradan hatırlayarak yazılan tutanak, davada karşı tarafın en kolay hedefidir.
* Boş tutanak imzalanmaz. "Sonra doldururuz" pratiği, resmî belgede sahtecilik tartışmasına kapı açar.
* Kamera kaydının muhafazası **yazılı olarak** talep edilir. Sistemler genellikle 7-30 gün sonra üzerine yazar `[T]`; talep edilmeyen kayıt kaybolur ve bu, davanın çökmesi anlamına gelir.

---

## 6. Üçüncü katman — Sınav sonrası analiz

### 6.1 Benzerlik analizi nasıl çalışıyor

Cevap kâğıtları sayısallaştırıldıktan sonra, aday çiftleri arasında şu karşılaştırmalar yapılır:

* **Ortak yanlışlar.** İki adayın aynı soruda aynı yanlış seçeneği işaretlemesi.
* **Boş bırakma örüntüsü.** Hangi soruların boş bırakıldığı, doğru cevaplar kadar bilgilendiricidir.
* **Seçenek tercihi dizisi.** Cevapların sırası ve dağılımı.
* **Bağlamsal veri.** Aynı salon, yakın oturma düzeni, aynı bina, ortak adres, akrabalık.

**Kilit nokta, sezgiye aykırıdır: ortak yanlışlar, ortak doğrulardan çok daha bilgilendiricidir.** İki iyi adayın doğruları zaten benzer olur — bu normaldir ve hiçbir şey kanıtlamaz. Ama iki adayın onlarca soruda aynı çeldiriciyi seçmesi, rastlantıyla açıklanması güç bir olaydır.

ÖSYM mevzuatı ve kılavuzları bu analizi açıkça duyuruyor: bilgisayar ortamında yapılan kopya analizinde ikili veya toplu kopya tespit edilirse ilgili test geçersiz sayılıyor, sonuç iptal ediliyor ve suç duyurusunda bulunuluyor `[D]`.

### 6.2 Bu analiz neyi yakalar, neyi yakalamaz

**Yakaladıkları:**
* İkili kopya (yan yana veya yakın oturan adaylar).
* Toplu kopya (aynı kaynaktan beslenen gruplar).
* Önceden dağıtılmış cevap anahtarı kullanımı — çünkü grup, kaynağın hatalarını da paylaşır.
* Salon veya bina düzeyinde sistematik anomali.

**Zayıf kaldığı yer — ve bunu açıkça söylemek gerekir:**
Dışarıdan tek bir adaya gelen, **doğru çözülmüş** cevaplar. Bu adayın örüntü ortağı yoktur. Profili yalnızca "beklenenden çok iyi" görünür. Ve "beklenenden iyi olmak" tek başına asla bir iptal gerekçesi olamaz — çünkü her sınavda binlerce aday gerçekten beklenenden iyi yapar.

İşte tam bu boşluk, **salon gözetiminin ve istihbaratın neden vazgeçilmez olduğunu** açıklıyor. Isparta vakasındaki aday istatistiksel olarak yakalanamazdı; onu polisin gözlemi yakaladı.

### 6.3 İstatistiğin sınırı ve yanlış pozitif

Benzerlik indeksleri olasılıksaldır, kesin değildir. Yüz binlerce adayın oluşturduğu milyonlarca çift karşılaştırıldığında, çok düşük bir eşik seçilse bile tesadüfen eşleşen çiftler çıkar. Buna çoklu karşılaştırma sorunu denir ve istatistiğin doğasında vardır.

Bu yüzden:

* İstatistik, **tek başına** karar dayanağı olarak kullanılmaz; salon tutanağı, oturma düzeni, kamera kaydı ve bağlam verisiyle birlikte değerlendirilir.
* İdari işlemin (sınav iptali) dayanağı olabilir; ceza yargılamasında ise **destekleyici delildir**, tek başına mahkûmiyet üretmez.
* Adayın idari yargı yolu açıktır ve mahkeme, kurumdan yöntemin gerekçesini isteyebilir.
* Salonda tutulan **somut** tutanak, istatistiğin en güçlü destekçisidir. Bu, sahadaki gözetmenin işinin sınav sonrasında da devam ettiği anlamına gelir.

---

## 7. Adli katman — ve sık yapılan hukuki hatalar

### 7.1 HTS ve baz istasyonu: gerçekten ne söyler

Adli soruşturmalarda, sınav saatlerinde bina çevresindeki baz istasyonlarından trafik yapan hatlar filtrelenebilir. Bu güçlü bir yöntemdir ama sınırları vardır ve bu sınırları bilmek, delili doğru kullanmak için şart:

* Bir baz istasyonu hücresinin kapsama alanı şehir merkezinde birkaç yüz metre, kırsalda kilometrelerce olabilir. Baz kaydı "bu kişi o salondaydı" demez; **"bu kişi o bölgedeydi"** der.
* Delil değeri korelasyondan doğar: dışarıdaki çözücü ekiple **zaman eşleşmesi**, aynı IMEI'de farklı hatların kullanımı, ödeme ve iletişim kayıtları, ve en önemlisi **suçüstü**.
* Tek başına baz kaydına dayanan bir iddia savunulabilir değildir.

### 7.2 Dijital delil: görevlinin en sık yaptığı hata

Bir cihaz ele geçirildiğinde:

* **Dokunmayın. Açmayın. Kapatmayın. İçine bakmayın.**
* Cihazı kolluğa teslim edin ve **teslim tutanağı** düzenleyin: cihazın tanımı, ele geçirildiği yer ve saat, teslim eden ve alan.
* Adli süreçte cihazın imajı alınır ve bütünlüğü kriptografik özet (hash) ile sabitlenir. Görevlinin cihazı açması veya kurcalaması, bu bütünlük zincirini kırar ve delili tartışmalı hale getirir.
* İyi niyetle "içinde ne var bakayım" demek, davanın en zayıf halkasını kendi elinizle üretmektir.

### 7.3 Tutanağın hukuki değeri

6114 sayılı Kanun kapsamında, sınavlarla ilgili görevlendirilenler — başka kamu kurumlarında veya özel kuruluşlarda çalışıyor olsalar bile — bu görevleri bakımından **kamu görevlisi sayılır** `[D]`.

Bunun iki sonucu var:

1. Düzenlediğiniz tutanak resmî belgedir ve delil değeri taşır.
2. Aynı nedenle, gerçeğe aykırı veya kasten eksik düzenlenmiş bir tutanak sizin için ciddi bir hukuki risktir.

---

## 8. Yeni tehdit yüzeyi: 2024-2026'da ne değişti

### 8.1 Yapay zekâ, iki ayrı cephede

**Cephe 1 — Soru çözme.** Isparta 2024 vakası bir eşiği geçti: soruyu çözen artık dışarıda oturan bir insan değil, bir model. Bunun operasyonel anlamı büyük — çünkü insan çözücü, bir soruya dakikalar harcar ve yorulur; model saniyeler harcar ve yorulmaz. Yani düzeneğin salonda kalması gereken süre kısaldı, iletim trafiği azaldı, tespit penceresi daraldı.

**Cephe 2 — Kimlik.** Mardin 2026 operasyonunda yapay zekâ ile üretilmiş sahte biyometrik fotoğrafların kullanıldığı bildirildi `[D]`. Biyometrik doğrulama, artık kendisi de üretilebilen bir veriyle karşı karşıya.

### 8.2 Donanım küçüldü, iz azaldı

* **eSIM:** Fiziksel SIM yuvası aramak artık bir kontrol değil `[T]`.
* **Kemik iletimli ses:** Kulak kanalında görünür bir cihaz olmadan ses iletimi mümkün.
* **Aralıklı ve düşük güçlü iletim:** Sürekli sinyal aramaya dayalı tespit yöntemleri, kısa aralıklarla veri gönderen cihazlarda zayıflar.
* **Giysiye entegre bileşenler:** İletken kumaş, dikişe gizlenmiş anten, astar içi devre.

Bunların ortak sonucu tek bir cümle: **tek bir kontrol noktasına dayalı savunma bitmiştir.** Geriye kalan tek işleyen model, katmanlı savunma + davranış gözlemi + istihbarat + sınav sonrası analiz.

### 8.3 Ve en önemli değişim: hedef kaydı

Büyük sınavlarda kolluk yoğunluğu çok yüksek. LGS 2026 için açıklanan rakamlar: Emniyet 81 ilde 4.261 okulda, Jandarma 14 ilde 18 sınav merkezindeki 21 binada; ülke genelinde toplam 29.103 personel ve 4.028 ekip `[D]`.

Bu yoğunluğa karşı düzenek kurmak pahalı ve riskli. Suç ekonomisi ise her ekonomi gibi davranır: **düşük kontrollü, yüksek ödüllü hedefe kayar.**

2026'daki organize kopya operasyonlarının hedefi bu yüzden ehliyet (MTSK) e-sınavlarıydı `[D]`:

* **Sakarya, Nisan 2026:** MTSK e-sınavını hedefleyen örgüte operasyon; 4 şüpheli, 208 kamera düzeneği, 120 batarya, 63 kulak içi kulaklık, 14 wifi cihazı; 10 milyon lira ciro.
* **Bafra, Nisan 2026:** İstihbarat üzerine, sınava girecek aday ve okula yakın bir otomobilde düzeneği yöneten 4 kişi suçüstü yakalandı.
* **Mardin, Haziran 2026:** 5 ilde operasyon, 44 şüpheli; gizli kamera, casus kulaklık ve yapay zekâ üretimi sahte biyometrik fotoğraf.

**Sınav bürosu için sonuç:** Risk sınıflandırmanızı sınavın prestijine göre değil, **kontrol yoğunluğu ile ödül büyüklüğünün oranına** göre yapın. Küçük ve rutin görünen sınavlar bugün en yüksek riskli olanlar.

### 8.4 E-sınavın kendine özgü riskleri

Kâğıt sınavda olmayan riskler:

* Soru ekranda durur; kamerayla kaydetmek, kitapçık çevirmekten kolaydır.
* Salon yazılımı ve istemci bilgisayarların bütünlüğü bir siber güvenlik konusudur — yerel yönetici hakları, USB portları, uzak masaüstü yazılımları, sanal makine kullanımı.
* Oturum devri (aday A oturumu açar, aday B devam eder) fiziksel joker'e göre daha sessiz bir yöntemdir.
* Ekran görüntüsü, ekranın kendi parlaklığından ötürü gizli kamerayla kâğıttan daha net çekilir `[T]`.

Karşılık: istemci kilitleme, USB kısıtı, ağ segmentasyonu ve giden trafik izleme, oturum boyunca periyodik kimlik teyidi, ekran arkası oturma düzeni, salon içi hareketli gözetim.

---

## 9. Saha kartı: davranışsal göstergeler ve taban oranı uyarısı

### 9.1 Önce uyarı: tek gösterge hiçbir şey ifade etmez

20 kişilik bir salonda her zaman 3-4 kişi kaskatı oturur, 2-3 kişi şakağını tutar, 1-2 kişi boşluğa bakar. Bunun sebebi kopya değil, **sınav stresidir.**

Bir göstergenin anlamlı hale gelmesi için üç koşul gerekir:

1. **Kümelenme** — aynı adayda en az üç ayrı gösterge.
2. **Süreklilik** — davranışın anlık değil, dakikalar boyunca tekrarlanması.
3. **Bağlam** — görevli yaklaşınca değişmesi, belirli zamanlarda yoğunlaşması.

Bu üçü yoksa, gördüğünüz şey büyük ihtimalle stres.

### 9.2 Gösterge tablosu

| # | Ne görürsünüz | Neyi düşündürür | Tek başına yeterli mi | Ne yaparsınız |
| --- | --- | --- | --- | --- |
| 1 | Gövde hiç bükülmüyor, dakikalarca aynı pozisyon | Göğüste sabit tutulması gereken donanım | Hayır | Not al, saatle birlikte kaydet |
| 2 | Kitapçık sıraya yatırılmıyor, göğüs hizasında dik tutuluyor | Kameraya açı verme | Hayır ama güçlü | Arkadan yaklaş, açıyı gözlemle |
| 3 | Bir el sürekli şakakta veya kulakta, baş tek omza eğik | Kulak içi cihazı duymaya çalışma | Hayır | İkinci gözetmene teyit ettir |
| 4 | Mevsime aykırı kalın giysi, kapalı yaka, kalın tabanlı ayakkabı | Donanım saklama hacmi | Hayır, tek başına asla | Girişte not edilmişse tutanağa iliştir |
| 5 | Sınavın ilk 15 dakikasında tuvalet talebi | Montaj penceresi | Hayır | Refakat et, kaydet, dönüşte gözlemi artır |
| 6 | Gözler kitapçıkta değil boşlukta; dudaklar kıpırdıyor | Soruyu sesli okuma / cevabı dinleme | Hayır ama güçlü | Yakınlaş, ritim değişiyor mu bak |
| 7 | Gövdeyi ışığa/pencereye çevirme, kâğıdı ışığa tutma | Kamera aydınlatması ayarlama | Hayır | Gözlemle, ışık kaynağıyla ilişkisini not et |
| 8 | Uzun süre boş cevap kâğıdı, son 20 dakikada seri kodlama | Toplu cevap alma | Hayır | Son dilimde gözetimi yoğunlaştır |
| 9 | Görevli yaklaşınca ani duruş ve ritim değişikliği | Bilinçli gizleme | **Tek başına en güçlü sinyal** | İki kez tekrarla ve doğrula |
| 10 | Kulakta kızarıklık, kulağa parmak sokma, kaşıma | Kulak içi yabancı cisim | Hayır | Not al; tıbbi cihaz ihtimalini kontrol ettir |
| 11 | Belirli bir yöne tekrar tekrar bakma (saate/kapıya değil) | Kamera veya işaret hattı | Hayır | Bakış yönünde ne var, tespit et |
| 12 | Sıradaki kitapçık türüyle uyumsuz hızlı ilerleme | Dışarıdan cevap | Hayır | Sınav sonrası analiz için tutanağa yaz |

### 9.3 Anlamlı olmayan, ama sık şüphelenilen davranışlar

Sık esneme, sık su içme (izinliyse), ayağını sallama, saati sık kontrol etme, kâğıda anlamsız çizim yapma, öksürme, gözlük silme, terleme. Bunlar sınav stresinin standart görüntüsüdür ve tek başlarına hiçbir şey ifade etmez. Bu maddeyi gözetmen brifingine mutlaka koyun; ekibin dikkati boş alarmlarla tükenmesin.

---

## 10. Müdahale protokolü ve tutanak dili

### 10.1 Kesinlikle yapılmayacaklar

* **Bağırmayın, adayın üzerine yürümeyin, arbede çıkarmayın.** Bu, salondaki diğer adayların sınav hakkını gasp eder ve sınavın tamamı için iptal gerekçesi doğurur.
* **Üst araması yapmayın.** Üst araması kolluk yetkisidir. Görevlinin adayı soyması veya cebini karıştırması hem hukuka aykırıdır hem delili tartışmalı hale getirir.
* **Cihaza dokunmayın, açmayın, kapatmayın.**
* **Sınavı kesmeyin.** Aday sınavına devam etsin; ihlal zaten kayıt altına alınıyor.
* **Sosyal medyada hiçbir şey paylaşmayın.** Ne olayı, ne soruları, ne fotoğrafı.
* **Tutanağı sonradan değiştirmeyin.** Eksik varsa ek tutanak düzenlenir, mevcut tutanak üzerinde oynanmaz.

### 10.2 Altı adımlı akış

1. **Doğrula.** İkinci gözetmenle sessizce teyit edin. Tek kişilik gözlem zayıftır; iki tanık, tutanağın gücünü katlar.
2. **Odaklı gözlem yapın.** 2-3 dakika boyunca, saat:dakika ile birlikte somut hareketleri not edin. Yorum değil, hareket.
3. **Salon başkanına fısıltıyla bildirin.** Adayı işaret etmeyin, ismini söylemeyin.
4. **Sınavı normal akışında sürdürün.** Gözetimi artırın, müdahale etmeyin.
5. **Bina sınav sorumlusuna ve kolluğa, sınav bitmeden bildirin.** Aday binadan çıkmadan kolluk hazır olmalı. Kontrol ve arama onların yetkisinde.
6. **Tutanağı olay anında yazın.** Sınav sonrasına bırakılan tutanak, hatırlamaya dayanır ve savunulması güçtür.

Cihaz ele geçirilirse: teslim tutanağı düzenleyin, kamera kaydının muhafazasını yazılı olarak talep edin, olay raporunu aynı gün tamamlayın.

### 10.3 Tutanak dili — bu belgenin en pratik kısmı

**Kötü tutanak:**

> "12 numaralı aday kopya çekti. Kulağında kulaklık olduğu anlaşıldı. Şüpheli davranışlar sergiledi ve uyarıldı."

Neden çöker:
* "Kopya çekti" bir **hukuki nitelendirmedir** — bu, görevlinin değil yargının işi.
* "Anlaşıldı" pasif ve kaynaksız: kim, nasıl, ne zaman anladı belli değil.
* "Şüpheli davranışlar" soyut; savunma tarafı "hangi davranış?" diye sorduğunda cevap yok.
* Saat yok, süre yok, ikinci tanık yok.
* "Uyarıldı" ifadesi, protokole aykırı bir müdahale yapıldığını da itiraf ediyor.

**İyi tutanak:**

> "A salonu, 12 sıra numaralı aday (aday no: ...). Saat 10:42'de sağ elini yaklaşık 4 dakika boyunca sağ kulağının üzerinde tuttu; başı bu süre boyunca sağ omzuna doğru eğikti. Saat 10:47'de soru kitapçığını sıraya yatırmadan göğüs hizasında dik konumda yaklaşık 30 saniye tuttu; bu sırada gövdesini pencere yönüne çevirdi. Aynı davranışlar salon görevlisi [Ad Soyad] tarafından 10:49'da bağımsız olarak gözlemlendi. Saat 10:52'de sıra aralığından geçilirken aday elini indirdi ve kitapçığı sıraya yatırdı. Durum 10:55'te bina sınav sorumlusuna sözlü olarak bildirildi. Adaya müdahale edilmemiş, sınavı kesilmemiş, salonda herhangi bir uyarı yapılmamıştır. Aday sınavını 12:30'da tamamlamış ve evrakını teslim etmiştir."

Farkı yapan altı şey: **saat, süre, somut hareket, ikinci bağımsız tanık, adayın yaklaşmaya verdiği tepki, yapılmayanların da kaydı.**

Son cümledeki "müdahale edilmemiştir" ifadesi kritik: sınavın usulüne uygun tamamlandığını ve adayın haklarının ihlal edilmediğini belgeler. Bu cümle olmadan, savunma tarafının ilk itirazı "görevli sınavı bozdu" olur.

---

## 11. Hukuki çerçeve

### 11.1 6114 sayılı Kanun

| Hüküm | Konu | Yaptırım |
| --- | --- | --- |
| **Madde 9 — Sınav güvenliği** | Sorular ve soruları hazırlayanların kimlikleri gizlidir; soru havuzu hiçbir surette üçüncü kişilere verilmez; adli ve idari soruşturmalarda havuza erişim Başkanlık iznine bağlıdır. Sınavdan sonra dahi — ezberlemek suretiyle elde edilmiş olsa bile — soruları kaydeden, saklayan, nakleden veya paylaşan yetkisiz kişiler ceza hükümleri kapsamına girer. | Madde 10'a atıf |
| **Madde 10/(1)** | Kanuna göre gizli olan bilgileri hukuka aykırı olarak elde etmek veya elinde bulundurmak | 1-4 yıl hapis (fiil daha ağır cezayı gerektiren başka bir suç oluşturmadığı takdirde) |
| **Madde 10/(2)** | Bu bilgileri ifşa etmek | 2-5 yıl hapis + 5.000 güne kadar adli para cezası |
| **Madde 10/(3)(a)** | **Ses veya görüntü nakleden cihaz kullanmak suretiyle kopya çekmek veya bu suretle kopya çekilmesine aracılık etmek** | 1-4 yıl hapis |
| **Madde 10/(3) devamı** | Başkasının yerine sınava girmek, kendi yerine başkasının girmesine katkı sağlamak, bireysel veya toplu kopya çekmek / çekilmesine imkân sağlamak | 1-4 yıl hapis |
| **Nitelikli hâl** | Suçun bir suç örgütünün faaliyeti çerçevesinde işlenmesi | Ceza yarı oranında artırılır |
| **Görevli statüsü** | Sınavlarla ilgili görevlendirilenler, başka kurumlarda çalışsalar dahi bu görevleri bakımından kamu görevlisi sayılır | Kamu görevlisine ilişkin hükümler uygulanır |
| **İdari yaptırım** | Kopya çektiği tespit edilen adayın sınavı Yönetim Kurulu kararıyla iptal edilir | Sınav iptali + sınav tarihinden itibaren **2 yıl** Başkanlıkça yapılan hiçbir sınava başvuramama ve girememe |

Bağlantılı olarak Türk Ceza Kanunu hükümleri de gündeme gelebilir: resmî belgede sahtecilik (sahte kimlik), bilişim sistemine hukuka aykırı erişim (e-sınav), suç işlemek amacıyla örgüt kurma veya üye olma, kişisel verilerin hukuka aykırı olarak ele geçirilmesi.

> **Not:** Bu tablo yönlendirici bir özettir, hukuki mütalaa değildir. Kanun metni değişebilir; işlem yaparken güncel metni resmî kaynaktan teyit edin.

### 11.2 Görevlinin kendi riski — bu kısmı atlamayın

Sınav görevlisi olarak kamu görevlisi sayıldığınız için, aşağıdakiler sizin açınızdan hem cezai hem disiplin riskidir:

* Soru kitapçığının fotoğrafını çekmek — sınav bittikten sonra bile.
* Soruları not etmek, ezberleyip aktarmak, tanıdığa anlatmak.
* Sınav evrakını binadan çıkarmak.
* Salonda kendi telefonunuzu bulundurmak.
* Aday yakınına salon veya sınav hakkında bilgi vermek.
* Sosyal medyada sınav içeriği paylaşmak.
* Akrabanızın veya öğrencinizin bulunduğu salonda görev almak (çıkar çatışması beyanı yapmamak).
* Tutanağı sonradan değiştirmek veya boş tutanak imzalamak.

Bunların hiçbiri "küçük usulsüzlük" kategorisinde değil. Madde 9 metni, soruların sınavdan sonra dahi yetkisiz biçimde kaydedilmesini ve paylaşılmasını açıkça kapsıyor.

---

## 12. Bina sınav sorumlusu için kontrol listesi

### T-30 gün

- [ ] Görevli listesi kesinleşti; her görevliden **çıkar çatışması ve akrabalık beyanı** alındı.
- [ ] Salon-görevli eşleştirmesi kurayla ve mümkün olduğunca geç yapılacak şekilde planlandı.
- [ ] Bina fiziki güvenlik taraması yapıldı: kilitlenmeyen kapılar, kırık pencereler, kontrolsüz yan girişler, asma tavanlar.
- [ ] Kamera sistemi çalışırlık testi yapıldı; **kayıt saklama süresi** öğrenildi ve yazıya geçirildi.
- [ ] Kolluk irtibat noktası belirlendi; kadın görevli sayısı planlandı.
- [ ] Sağlık raporlu / engelli aday ve izinli tıbbi cihaz listesi temin edildi.

### T-1 gün

- [ ] Tuvalet, koridor, çöp kutuları, pencere pervazları, saksılar, panolar, sıralar süpürüldü. **Süpürme, bina açılmadan önce yapıldı.**
- [ ] Sıra düzeni ve numaralandırma tamamlandı; oturma planı kaydedildi (sınav sonrası analiz için kritik).
- [ ] Yedek evrak ve tutanak formları hazır.
- [ ] Kapı kontrol noktası sayısı, aday sayısına göre hesaplandı; kademeli giriş saatleri belirlendi.
- [ ] Görevli telefonlarının nerede toplanacağı belirlendi.

### Sınav sabahı

- [ ] Evrak kutusu mühür kontrolü yapıldı ve tutanağa geçirildi. **Mühür şüpheliyse kutu açılmadı, merkeze bildirildi.**
- [ ] Bina erken açıldı; giriş kademeli işletiliyor.
- [ ] Kimlik + çip + fotoğraf teyidi ışıkta yapılıyor.
- [ ] İkinci hat (derinlemesine arama) kuruldu ve ana kuyruğu tıkamıyor.
- [ ] 30 saniyelik gözetmen brifingi verildi: bugün neye bakıyoruz, neye bakmıyoruz, şüphede ne yapıyoruz.

### Sınav sırasında

- [ ] Gözetmenler ayakta ve rotasyonda; düzensiz aralıklarla tur atıyorlar.
- [ ] Tuvalet talepleri tek tek, refakatli ve kayıtlı.
- [ ] İlk 20 ve son 20 dakikada gözetim yoğunlaştırıldı.

### Sınav sonrası

- [ ] Evrak sayımı yapıldı ve tuttu; mühürlendi.
- [ ] Tutanaklar **tek tek okundu**. Soyut, saatsiz, tanıksız tutanaklar geri yazdırıldı.
- [ ] Kamera kaydı muhafaza talebi yazılı olarak yapıldı.
- [ ] Kolluğa teslim edilen cihaz varsa teslim tutanağı düzenlendi.
- [ ] Olay raporu aynı gün merkeze iletildi.

---

## 13. Ölçme: bu sistem çalışıyor mu?

Güvenlik programı ölçülmüyorsa yönetilmiyordur. Bina ve il düzeyinde izlenmesi gereken göstergeler:

| Gösterge | Ne söyler | Uyarı eşiği |
| --- | --- | --- |
| Salon başına tutanak oranı | Gözetimin fiilen yapılıp yapılmadığı | **Sıfır tutanak iyi haber değildir.** Hiç tutanağı olmayan bina, ya çok iyi ya da hiç bakmıyor — hangisi olduğunu ayırt etmeniz gerekir |
| Tutanakların somutluk oranı | Saat, süre, tanık ve somut hareket içeren tutanakların yüzdesi | %70'in altı, eğitim ihtiyacı demektir |
| Kapı geçiş süresi ölçümü | Aramanın gerçekten yapılıp yapılamadığı | Aday başına 8 saniyenin altına inen noktalar plan hatasıdır |
| Tuvalet kaydı tutulma oranı | En kritik kör noktanın kontrolü | %100 dışında kabul edilebilir değer yok |
| Kamera kayıt bütünlüğü | Delilin sonradan bulunabilirliği | Kayıp/bozuk kanal sayısı sıfır olmalı |
| Sınav sonrası anomali ile salon tutanağı örtüşmesi | Salon gözetiminin gerçekten görüp görmediği | Anomali çıkan salonda tutanak yoksa, o salonda gözetim sorunu var |
| İtiraz ve iptal sonuçları | Kararların hukuken ayakta kalıp kalmadığı | İdari yargıda bozulan kararlar, tutanak kalitesine geri döner |

**Sık yapılan yorum hatası:** "Bu binada yıllardır hiç olay olmadı." Bu cümle bir başarı raporu değil, bir ölçüm sorunudur. Olayın olmaması ile olayın görülmemesi, veriden ayırt edilemez. Ayırt etmenin yolu, yukarıdaki süreç göstergelerini izlemektir — sonuç göstergelerini değil.

---

## 14. Özet: on cümlede savunma felsefesi

1. Hiçbir tek kontrol yeterli değildir; savunma katmanlıdır ve katmanlar birbirinin körlüğünü kapatır.
2. Rakibin cihazının çalışmadığını varsaymayın; çalışıyor.
3. En zayıf halkanız kapı değil, kapıdan sonraki on beş dakikadır.
4. Gözetmenin dikkati sınırlı bir kaynaktır; rotasyon ve brifingle yönetilir.
5. Tek gösterge gürültüdür; kümelenme sinyaldir.
6. Yorum yazmayın, gözlem yazın. Nitelendirme yargının işi.
7. Delili bozmayın: cihaza dokunmayın, kaydı kaybetmeyin, tutanağı sonradan yazmayın.
8. İstatistik güçlüdür ama tek başına delil değildir; salonun gözü onu tamamlar.
9. Risk, sınavın prestijine göre değil, kontrol yoğunluğu ile ödül oranına göre dağılır — küçük sınavlar bugün en riskli olanlar.
10. Sistemin ölçülmeyen kısmı, korunmayan kısmıdır.

---

## 15. Kaynaklar

**Mevzuat**
* 6114 sayılı Ölçme, Seçme ve Yerleştirme Merkezi Hizmetleri Hakkında Kanun, Madde 9 (Sınav güvenliği) ve Madde 10 (Ceza hükümleri). Güncel metin: mevzuat.gov.tr

**Kapalı dönem ve soru güvenliği**
* [ÖSYM'nin sınav soruları, yüksek güvenlikli "kozmik oda"da hazırlanıyor — Anadolu Ajansı](https://www.aa.com.tr/tr/egitim/osymnin-sinav-sorulari-yuksek-guvenlikli-kozmik-odada-hazirlaniyor/3015258)
* [Faraday kafesi ve sinyal karıştırıcı jammer; çöpler bile 45 gün dışarı çıkmıyor — T24](https://t24.com.tr/gundem/faraday-kafesi-ve-sinyal-karistirici-jammer-copler-bile-45-gun-disari-cikmiyor-osym-sinav-merkezinin-kapilarini-ilk-kez-acti,1161187)
* [ÖSYM Başkanı Ersoy anlattı: Sorular nasıl hazırlanıyor? — Memurlar.net](https://www.memurlar.net/haber/1077315/osym-baskani-ersoy-anlatti-sorular-nasil-hazirlaniyor.html)

**Isparta 2024 — yapay zekâ destekli düzenek**
* [YKS'de düğme kamera ve yapay zeka ile kopyaya tutuklama — TRT Haber](https://www.trthaber.com/haber/turkiye/yksde-dugme-kamera-ve-yapay-zeka-ile-kopyaya-tutuklama-862872.html)
* [2024 YKS'de yapay zekalı kopya — Milliyet](https://www.milliyet.com.tr/gundem/2024-yksde-yapay-zekali-kopya-sorulari-chatgptye-cozdururken-yakalandi-7139932)
* [YKS'de yapay zekayla kopya çeken aday, 2 yıl hiçbir sınava giremeyecek — Anadolu Ajansı](https://www.aa.com.tr/tr/egitim/yksde-yapay-zekayla-kopya-ceken-aday-2-yil-hicbir-sinava-giremeyecek/3246771)

**2010 KPSS**
* [KPSS'de örgütlü hırsızlık: 3 bin 229 görünen "şampiyon" sayısı sınav yenilenince 76'ya düştü — T24](https://t24.com.tr/ozel-dosya/kpss-de-orgutlu-hirsizlik-3-bin-229-gorunen-sampiyon-sayisi-sinav-yenilenince-76-ya-dustu-suc-vardi-itiraf-vardi-suclu-vardi-ceza-yoktu,968166)
* [2010 KPSS'de soruşturma dosyası 5 yıl sonra tamamlandı — Memurlar.net](https://www.memurlar.net/haber/536175/2010-kpss-de-sorusturma-dosyasi-5-yil-sonra-tamamlandi.html)
* [Savcılıktan "KPSS'de kopya" açıklaması — bianet](https://bianet.org/haber/savciliktan-kpss-de-kopya-aciklamasi-163239)

**Organize kopya operasyonları (2026)**
* [10 milyonluk vurgun yapan "ehliyet sınavı kopya" çetesi çökertildi — Sabah](https://www.sabah.com.tr/sakarya/2026/04/24/10-milyonluk-vurgun-yapan-ehliyet-sinavi-kopya-cetesi-cokertildi)
* [Ehliyet sınavında organize kopya girişimi; düzeneği satan da kuran da tutuklandı — DHA](https://www.dha.com.tr/gundem/ehliyet-sinavinda-organize-kopya-girisimi-duzenegi-satan-da-kuran-da-tutuklandi-2532717)
* [5 ilde ehliyet sınavı çetesine operasyon — Yeni Journal](https://www.yenijournal.com/5-ilde-ehliyet-sinavi-cetesine-operasyon)
* [20 bin liraya ehliyet sınavlarına kopya düzeneği hazırlıyorlar — NTV](https://www.ntv.com.tr/turkiye/20-bin-liraya-ehliyet-sinavlarina-kopya-duzenegi-hazirliyorlar,fnKIEokPCEKkEP7X6GMifw)

**MEB tarafı**
* [LGS 2026 için tüm tedbirler alındı — MEB Personel](https://mebpersonel.com/meb-personel/lgs-2026-icin-tum-tedbirler-alindi-guvenlik-ust-duzeyde-iste-lgs-h140341.html)
* [Açık Öğretim Kurumları sınav uygulamasında dikkat edilecek hususlar — MEB](https://mus.meb.gov.tr/meb_iys_dosyalar/2025_12/16142400_dikkatedilecekhususlaraoks12025.pdf)

---

*Bu belge savunma ve tespit amaçlıdır. İhlal yöntemlerine ilişkin ayrıntılar, yalnızca sınav görevlisinin ne arayacağını ve neyi kayda geçireceğini bilmesi için, kamuya açık adli vakalar ve resmî açıklamalar düzeyinde tutulmuştur.*
