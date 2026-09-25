/* =====================================================================
   SEVİLEN KUYUMCULUK — SİTE AYARLARI
   Sitede değiştirmek isteyeceğiniz her şey bu dosyada:
   iletişim bilgileri, çalışma saatleri, fiyat tablosu ayarları.
   Fiyat listesi ve kâr marjı: api/ayarlar.php
   ===================================================================== */

window.SEVILEN = {

  /* ---------------------------------------------------------------
     İLETİŞİM BİLGİLERİ
     DİKKAT: Aşağıdakiler ÖRNEK bilgilerdir, kendi bilgilerinizi yazın.
     --------------------------------------------------------------- */
  firma: {
    ad: 'Sevilen Kuyumculuk',
    telefon: '0546 881 71 75',          // sitede görünen hali
    telefonArama: '+905468817175',      // arama linki için (boşluksuz, +90 ile)
    whatsapp: '905468817175',           // başında + olmadan, 90 ile başlayarak
    whatsappMesaj: 'Merhaba, fiyat bilgisi almak istiyorum.',
    instagram: 'sevilenkuyumculuk',     // @ işareti olmadan
    adres: 'Kuyumcular Çarşısı No: 00, Eyyübiye / Şanlıurfa',
    sehir: 'Şanlıurfa',
    konumKisa: 'Şanlıurfa · Kuyumcular Çarşısı',
    haritaArama: 'Kuyumcular Çarşısı, Eyyübiye, Şanlıurfa', // Google Haritalar'da aranacak metin

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
  }
};

/* Fiyat tablosu bileşeninin ayarları (js/fiyat-tablosu.js) */
window.FIYAT_TABLOSU = {
  adres: 'api/fiyatlar.php',   // sunucudaki fiyat uç noktası
  yenilemeSaniye: 10,          // tablo kaç saniyede bir yenilensin
  eskiUyariDakika: 5,          // fiyatlar bu kadar dakikadır değişmediyse uyarı göster

  // Ekranda virgülden sonra kaç hane gösterilsin. 0 hanede kuruş ŞUKOB'daki
  // gibi kesilir (6659,77 → 6.659), diğerlerinde yuvarlanır (55,406 → 55,41).
  ondalik: {
    varsayilan: 0,   // altın, sarrafiye ve gümüş: kuruşsuz (6.659 ; 93)
    USD: 3,          // 48,813
    EUR: 3
  }
};
