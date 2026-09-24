<?php
/* =====================================================================
   FİYAT AYARLARI
   api/fiyatlar.php bu dosyayı okur. Değişiklik hemen geçerli olur.
   ===================================================================== */

return [

    // Gösterilecek ürünler, bu sırayla.  kod => sitede görünecek ad
    // Ad yerine null yazarsanız ŞUKOB'daki ad kullanılır.
    // Göstermek istemediğiniz satırı silin ya da başına // koyun.
    'urunler' => [
        'HAS'             => 'Has Altın',
        '22_ayar_bilezik' => '22 Ayar Bilezik',
        'hurda'           => '22 Ayar Hurda',
        'yeni_ceyrek'     => 'Yeni Çeyrek',
        'yeni_yarim'      => 'Yeni Yarım',
        'yeni_ziynet'     => 'Yeni Ziynet',
        'eski_ceyrek'     => 'Eski Çeyrek',
        'eski_yarim'      => 'Eski Yarım',
        'eski_ziynet'     => 'Eski Ziynet',
        'cnc'             => 'CNC',
        'sarnel'          => 'Şarnel',
        'GMS'             => 'Gümüş',
        'USD'             => 'Dolar',
        'EUR'             => 'Euro',
    ],

    // Satış fiyatına eklenecek kâr marjı, yüzde olarak. Örnek: 1.5 → %1,5
    'kar_marji_yuzde' => 0,

    // Kaynağa en fazla kaç saniyede bir gidilsin (en az 10). ŞUKOB'un kendi
    // sayfası da 10 saniyede bir yeniliyor; tek ziyaretçi yükü kadardır.
    'onbellek_sn' => 10,

    // Cloudflare engeli görülürse kaynak bu kadar saniye hiç denenmez
    'engel_bekleme_sn' => 600,

    // Kaynak ayarları (genelde değiştirmeniz gerekmez)
    'kaynak_url'     => 'https://sukobfiyat.com/api/prices/',
    'zaman_asimi_sn' => 8,

    // Kurulum testi: api/fiyatlar.php?tani=1  (kurulum bitince false yapın)
    'tani_acik' => true,
];
