/* =====================================================================
   SEVİLEN KUYUMCULUK — SİTE AYARLARI
   Sitede değiştirmek isteyeceğiniz her şey bu dosyada:
   iletişim bilgileri, çalışma saatleri, öne çıkan fiyatlar.
   Fiyat listesi ve kâr marjı: api/ayarlar.php
   ===================================================================== */

window.SEVILEN = {

  /* ---------------------------------------------------------------
     İLETİŞİM BİLGİLERİ
     DİKKAT: Aşağıdakiler ÖRNEK bilgilerdir, kendi bilgilerinizi yazın.
     --------------------------------------------------------------- */
  firma: {
    ad: 'Sevilen Kuyumculuk',
    telefon: '0414 000 00 00',          // sitede görünen hali
    telefonArama: '+904140000000',      // arama linki için (boşluksuz, +90 ile)
    whatsapp: '905000000000',           // başında + olmadan, 90 ile başlayarak
    whatsappMesaj: 'Merhaba, fiyat bilgisi almak istiyorum.',
    instagram: 'sevilenkuyumculuk',     // @ işareti olmadan
    adres: 'Kuyumcular Çarşısı No: 00, Eyyübiye / Şanlıurfa',
    sehir: 'Şanlıurfa',
    konumKisa: 'Şanlıurfa · Kuyumcular Çarşısı',
    haritaArama: 'Kuyumcular Çarşısı, Eyyübiye, Şanlıurfa', // Google Haritalar'da aranacak metin
    kurulusYili: 1998,

    // 0 = Pazar, 1 = Pazartesi ... 6 = Cumartesi. Kapalı gün için null yazın.
    calismaSaatleri: {
      1: ['09:00', '19:30'],
      2: ['09:00', '19:30'],
      3: ['09:00', '19:30'],
      4: ['09:00', '19:30'],
      5: ['09:00', '19:30'],
      6: ['09:00', '19:30'],
      0: null
    }
  },

  /* ---------------------------------------------------------------
     ÜST KISIMDA ÖNE ÇIKAN FİYATLAR (ŞUKOB ürün kodları)
     Hangi ürünlerin listede görüneceği, adları ve kâr marjı ise
     sunucudaki api/ayarlar.php dosyasından yönetilir.
     --------------------------------------------------------------- */
  vitrin: {
    ana: 'HAS',
    anaNot: '995',                 // ana fiyatın yanındaki ayar damgası (boş bırakılabilir)
    yan: ['yeni_ceyrek', '22_ayar_bilezik', 'USD', 'EUR']
  },

  /* ---------------------------------------------------------------
     HESAPLAMA ARACINDA MİKTAR BİRİMİ
     Burada olmayan ürünler "adet" ile hesaplanır.
     --------------------------------------------------------------- */
  birimler: {
    HAS: 'gram',
    '22_ayar_bilezik': 'gram',
    hurda: 'gram',
    cnc: 'gram',
    sarnel: 'gram',
    GMS: 'gram',
    USD: 'USD',
    EUR: 'EUR'
  },

  // İşçilik ücreti ayrıca alınan ürünler (hesaplama sonucunda not düşülür)
  iscilikli: ['22_ayar_bilezik', 'cnc', 'sarnel']
};

/* Fiyat tablosu bileşeninin ayarları (js/fiyat-tablosu.js) */
window.FIYAT_TABLOSU = {
  adres: 'api/fiyatlar.php',   // sunucudaki fiyat uç noktası
  yenilemeSaniye: 10,          // tablo kaç saniyede bir yenilensin
  eskiUyariDakika: 5,          // fiyatlar bu kadar dakikadır değişmediyse uyarı göster

  // Ekranda virgülden sonra kaç hane gösterilsin. 0 hanede kuruş ŞUKOB'daki
  // gibi kesilir (6659,77 → 6.659), diğerlerinde yuvarlanır (55,406 → 55,41).
  // Hesaplama da ekranda görünen fiyatla yapılır.
  ondalik: {
    varsayilan: 0,   // altın, sarrafiye ve gümüş: kuruşsuz (6.659 ; 93)
    USD: 2,          // 48,81
    EUR: 2
  }
};
