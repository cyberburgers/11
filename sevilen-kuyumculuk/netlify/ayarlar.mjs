/* =====================================================================
   FİYAT AYARLARI — NETLIFY SÜRÜMÜ
   Site Netlify'da çalışırken fiyat uç noktası bu dosyayı kullanır.
   (PHP hostingde aynı ayarlar api/ayarlar.php içindedir.)
   Değişiklikten sonra GitHub'a gönderin; Netlify siteyi kendisi yeniler.
   ===================================================================== */

export default {

  // Gösterilecek ürünler, bu sırayla.  kod: 'sitede görünecek ad'
  // Ad yerine null yazarsanız ŞUKOB'daki ad kullanılır.
  urunler: {
    HAS: 'Has Altın',
    '22_ayar_bilezik': '22 Ayar Bilezik',
    hurda: '22 Ayar Hurda',
    eski_ceyrek: 'Eski Çeyrek',
    yeni_ceyrek: 'Yeni Çeyrek',
    eski_yarim: 'Eski Yarım',
    yeni_yarim: 'Yeni Yarım',
    eski_ziynet: 'Eski Ziynet',
    yeni_ziynet: 'Yeni Ziynet',
    cnc: 'CNC',
    sarnel: 'Şarnel',
    GMS: 'Gümüş',
    USD: 'Dolar',
    EUR: 'Euro'
  },

  // Satış fiyatına eklenecek kâr marjı, yüzde olarak. Örnek: 1.5 → %1,5
  karMarjiYuzde: 0,

  // Kaynağa en fazla kaç saniyede bir gidilsin (en az 10).
  // Netlify ücretsiz kotası için yükseltilebilir (ör. 30).
  onbellekSn: 10,

  // Cloudflare engeli görülürse kaynak bu kadar saniye hiç denenmez
  engelBeklemeSn: 600,

  // Kaynak ayarları (genelde değiştirmeniz gerekmez)
  kaynakUrl: 'https://sukobfiyat.com/api/prices/',
  zamanAsimiSn: 8,

  // Kurulum testi: /api/tani  (kurulum bitince false yapın)
  taniAcik: false
};
