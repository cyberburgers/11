/* =====================================================================
   SEVİLEN KUYUMCULUK — SİTE AYARLARI
   Sitede değiştirmek isteyeceğiniz her şey bu dosyada:
   iletişim bilgileri, çalışma saatleri, fiyat listesi ve kâr payı.
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
     FİYAT BAĞLANTISI
     --------------------------------------------------------------- */
  fiyat: {
    adres: 'api/fiyatlar.php',   // ŞUKOB fiyatlarını getiren sunucu dosyası
    yenilemeSaniye: 30,          // fiyatlar kaç saniyede bir yenilensin
    kaynakAdi: 'ŞUKOB',

    // Örnek (sahte) fiyat gösterimi:
    //  'otomatik' → yalnızca bilgisayarınızda denerken, bağlantı yoksa örnek fiyat gösterir.
    //               Yayındaki sitede ASLA örnek fiyat göstermez.
    //  false      → hiçbir zaman örnek fiyat gösterme.
    ornekFiyat: 'otomatik'
  },

  /* ---------------------------------------------------------------
     ÜST KISIMDA ÖNE ÇIKAN FİYATLAR (aşağıdaki kalem kimlikleri)
     --------------------------------------------------------------- */
  vitrin: {
    ana: 'gram',
    yan: ['ceyrek', 'ayar22', 'usd', 'eur']
  },

  /* ---------------------------------------------------------------
     FİYAT LİSTESİ
     Her kalem için:
       ad        → sitede görünen isim
       not       → ismin altındaki küçük bilgi (ayar damgası, ağırlık, döviz kodu)
       notTur    → 'damga' | 'agirlik' | 'kod'
       eslesme   → ŞUKOB listesinde bu kalemi bulmak için aranan kelimeler.
                   Sırayla denenir; bir satırdaki tüm kelimeler geçmeli.
       haric     → isminde bu kelimelerden biri geçen satırlar atlanır.
       kaynakAdi → (isteğe bağlı) ŞUKOB'daki ismin birebir aynısı; yazılırsa
                   eslesme yerine bu kullanılır.
       birim     → hesaplama aracında miktar birimi
       ondalik   → virgülden sonra kaç hane gösterilsin (varsayılan 2)

     KÂR PAYI (isteğe bağlı, TL cinsinden, eksi de olabilir):
       alisFark: -10   → alış fiyatını 10 TL düşürür
       satisFark: 25   → satış fiyatını 25 TL artırır
     ŞUKOB zaten kuyumcu tavsiye fiyatı verdiği için varsayılan 0'dır.
     --------------------------------------------------------------- */
  gruplar: [
    {
      id: 'gram-altin',
      baslik: 'Gram Altın',
      birimYazi: '₺ / gram',
      kalemler: [
        { id: 'has',    ad: 'Has Altın',          not: '995', notTur: 'damga', birim: 'gram',
          eslesme: ['HAS ALTIN', 'HAS'], haric: ['USD', 'ONS', 'KG'] },
        { id: 'gram',   ad: 'Gram Altın',         not: '995', notTur: 'damga', birim: 'gram',
          eslesme: ['GRAM ALTIN', '24 AYAR', 'GRAM'], haric: ['HAS', 'GUMUS', '22', '18', '14', 'ONS'] },
        { id: 'ayar22', ad: '22 Ayar Bilezik',    not: '916', notTur: 'damga', birim: 'gram',
          eslesme: ['22 AYAR', '22'] },
        { id: 'ayar18', ad: '18 Ayar',            not: '750', notTur: 'damga', birim: 'gram',
          eslesme: ['18 AYAR', '18'] },
        { id: 'ayar14', ad: '14 Ayar',            not: '585', notTur: 'damga', birim: 'gram',
          eslesme: ['14 AYAR', '14'] }
      ]
    },
    {
      id: 'sarrafiye',
      baslik: 'Sarrafiye',
      birimYazi: '₺ / adet',
      kalemler: [
        { id: 'ceyrek', ad: 'Çeyrek',             not: '1,75 g',  notTur: 'agirlik', birim: 'adet',
          eslesme: ['CEYREK'], haric: ['ESKI'] },
        { id: 'yarim',  ad: 'Yarım',              not: '3,51 g',  notTur: 'agirlik', birim: 'adet',
          eslesme: ['YARIM'], haric: ['ESKI'] },
        { id: 'tam',    ad: 'Tam',                not: '7,02 g',  notTur: 'agirlik', birim: 'adet',
          eslesme: ['TAM', 'TEKLIK'], haric: ['ESKI', 'YARIM'] },
        { id: 'ata',    ad: 'Ata',                not: '7,22 g',  notTur: 'agirlik', birim: 'adet',
          eslesme: ['ATA', 'CUMHURIYET'], haric: ['ESKI', '5', 'BESLI', '2', 'IKI'] },
        { id: 'gremse', ad: 'Gremse',             not: '17,54 g', notTur: 'agirlik', birim: 'adet',
          eslesme: ['GREMSE', 'IKIBUCUK'], haric: ['ESKI'] }
      ]
    },
    {
      id: 'doviz',
      baslik: 'Döviz',
      birimYazi: '₺ / birim',
      kalemler: [
        { id: 'usd', ad: 'Amerikan Doları',  not: 'USD', notTur: 'kod', birim: 'USD',
          eslesme: ['USD', 'AMERIKAN DOLARI', 'DOLAR'] },
        { id: 'eur', ad: 'Euro',             not: 'EUR', notTur: 'kod', birim: 'EUR',
          eslesme: ['EUR', 'EURO', 'AVRO'], haric: ['USD'] },
        { id: 'gbp', ad: 'İngiliz Sterlini', not: 'GBP', notTur: 'kod', birim: 'GBP',
          eslesme: ['GBP', 'STERLIN'] },
        { id: 'chf', ad: 'İsviçre Frangı',   not: 'CHF', notTur: 'kod', birim: 'CHF',
          eslesme: ['CHF', 'FRANK', 'FRANGI'] },
        { id: 'sar', ad: 'Suudi Riyali',     not: 'SAR', notTur: 'kod', birim: 'SAR',
          eslesme: ['SAR', 'RIYAL', 'RIYALI'] }
      ]
    },
    {
      id: 'piyasa',
      baslik: 'Piyasa',
      gorunum: 'serit',          // tablo yerine ince şerit olarak gösterilir
      kalemler: [
        { id: 'ons',   ad: 'Ons Altın',  onEk: '$', hesapla: false,
          eslesme: ['ONS', 'XAU'], haric: ['GUMUS', 'XAG'] },
        { id: 'gumus', ad: 'Gram Gümüş', birim: 'gram',
          eslesme: ['GUMUS'], haric: ['ONS', 'USD', 'XAG', 'KG'] }
      ]
    }
  ]
};
