/* =====================================================================
   FİYAT TABLOSU BİLEŞENİ
   Herhangi bir sayfada kullanmak için:

     <link rel="stylesheet" href="css/fiyat-tablosu.css">
     <div data-fiyat-tablosu></div>
     <script src="js/fiyat-tablosu.js"></script>

   İsteğe bağlı nitelikler:
     data-kodlar="HAS,USD,EUR"      → yalnızca bu ürünler, bu sırayla
     data-gruplar="Başlık:KOD,KOD|Başlık:KOD"  → ürünleri başlıklı tablolara böler
     data-baslik="Güncel fiyatlar"  → tablonun üstündeki başlık
     data-duzen="tek"               → gruplar ayrı kutular yerine tek tabloda,
                                      başlık satırlarıyla gösterilir

   Ayar (isteğe bağlı, bu dosyadan önce):
     window.FIYAT_TABLOSU = { adres: 'api/fiyatlar.php', yenilemeSaniye: 30,
                              ondalik: { varsayilan: 2, USD: 3 } };
     Kuruşsuz (0 hane) gösterilenler ŞUKOB listesi gibi kesilir, diğerleri yuvarlanır.
     Diğer kodlar aynı sayıyı FiyatTablosu.kes(kod, deger) ve
     FiyatTablosu.bicimle(kod, deger) ile gösterebilir.

   Sayfadaki başka kodlar için olaylar (document üzerinde):
     'fiyatlar:guncellendi'  detail: { liste, degisim, bayat, sonGuncelleme }
     'fiyatlar:hata'         detail: { liste (varsa eski veri) }
   Sayfada kaç tablo olursa olsun sunucuya tek istek gider.
   ===================================================================== */
(function () {
  'use strict';

  var AYAR = window.FIYAT_TABLOSU || {};
  var ADRES = AYAR.adres || 'api/fiyatlar.php';
  var YENILEME_MS = (AYAR.yenilemeSaniye || 30) * 1000;
  // ŞUKOB cevap verse bile fiyatlar bu kadar dakikadır değişmediyse uyar
  var ESKI_DK = AYAR.eskiUyariDakika || 5;
  var KAYNAK_YAZISI = 'Bilgi amaçlıdır, yatırım tavsiyesi değildir.';

  var ONDALIK = AYAR.ondalik || {};
  var bicimler = {};

  function hane(kod) {
    var d = ONDALIK[kod];
    if (d == null) d = ONDALIK.varsayilan;
    return d == null ? 2 : d;
  }

  // Kuruşsuz gösterilenlerde (altın, gümüş) ŞUKOB gibi keser: 6659,77 → 6659
  // Ondalıklı gösterilenlerde (döviz) yuvarlar: 55,406 → 55,41
  function kes(kod, deger) {
    if (deger == null || !isFinite(deger)) return null;
    var d = hane(kod);
    if (d === 0) return Math.floor(deger + 1e-6);
    var c = Math.pow(10, d);
    return Math.round(deger * c) / c;
  }

  function bicimle(kod, deger) {
    var n = kes(kod, deger);
    if (n == null) return '—';
    var d = hane(kod);
    if (!bicimler[d]) bicimler[d] = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
    return bicimler[d].format(n);
  }
  var saat = function (iso) {
    var t = new Date(iso);
    if (isNaN(t)) return '';
    try {
      return t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Istanbul' });
    } catch (e) {
      return t.toLocaleTimeString('tr-TR');
    }
  };

  var durum = { liste: null, onceki: {}, bayat: false, hata: false, sonGuncelleme: null };
  var tablolar = [];
  var zamanlayici = null;
  var sonIstek = 0;

  /* ---------- Veri ---------- */

  var istekte = false;

  function cek() {
    clearTimeout(zamanlayici);
    if (istekte) return; // önceki istek sürerken ikincisini atma
    istekte = true;
    sonIstek = Date.now();

    var istek;
    if (typeof AYAR.ornekVeri === 'function') {
      istek = Promise.resolve({ liste: AYAR.ornekVeri(), bayat: false });
    } else {
      // Sunucu cevap vermezse 12 sn sonra vazgeç, sonraki turda yeniden dene
      var iptal = window.AbortController ? new AbortController() : null;
      var sure = iptal ? setTimeout(function () { iptal.abort(); }, 12000) : null;
      // Adrese zaman damgası eklenmez: sunucu/CDN önbelleği ortak kalsın
      istek = fetch(ADRES, { cache: 'no-store', headers: { Accept: 'application/json' }, signal: iptal ? iptal.signal : undefined })
        .then(function (r) {
          clearTimeout(sure);
          if (!r.ok) throw new Error('HTTP ' + r.status);
          var bayat = r.headers.get('X-Fiyat-Durumu') === 'bayat';
          var yas = parseInt(r.headers.get('X-Fiyat-Yasi'), 10);
          return r.json().then(function (liste) { return { liste: liste, bayat: bayat, yas: isNaN(yas) ? null : yas }; });
        });
    }

    istek
      .then(function (s) {
        if (!Array.isArray(s.liste) || !s.liste.length) throw new Error('Boş yanıt');
        basarili(s.liste, s.bayat, s.yas);
      })
      .catch(function () {
        durum.hata = true;
        tumunuCiz({});
        olay('fiyatlar:hata', { liste: durum.liste, uyari: uyariMetni() });
      })
      .then(function () {
        istekte = false;
        if (!document.hidden) zamanlayici = setTimeout(cek, YENILEME_MS);
      });
  }

  function basarili(liste, bayat, yas) {
    var degisim = {};
    var enYeni = null;
    liste.forEach(function (o) {
      var eski = durum.onceki[o.kod];
      if (eski) {
        degisim[o.kod] = {
          alis: yon(eski.alis, o.alis),
          satis: yon(eski.satis, o.satis)
        };
      }
      durum.onceki[o.kod] = { alis: o.alis, satis: o.satis };
      if (o.guncelleme && (!enYeni || o.guncelleme > enYeni)) enYeni = o.guncelleme;
    });
    durum.liste = liste;
    durum.bayat = bayat;
    durum.hata = false;
    durum.sonGuncelleme = enYeni;
    durum.yas = yas == null ? null : yas;
    durum.yasAlindi = Date.now();
    tumunuCiz(degisim);
    olay('fiyatlar:guncellendi', { liste: liste, degisim: degisim, bayat: bayat, eski: uyariVar(), sonGuncelleme: enYeni });
  }

  // Verinin şu anki yaşı (sn). Sunucunun bildirdiği yaş + o andan beri geçen süre.
  function veriYasi() {
    if (durum.yas == null) return null;
    return durum.yas + Math.round((Date.now() - durum.yasAlindi) / 1000);
  }

  function sureYaz(sn) {
    var dk = Math.max(1, Math.round(sn / 60));
    if (dk < 60) return dk + ' dakika';
    var sa = Math.floor(dk / 60);
    return sa < 48 ? sa + ' saat' : Math.floor(sa / 24) + ' gün';
  }

  // Ziyaretçiyi uyaracak bir durum var mı? Varsa metnini döner.
  function uyariMetni() {
    if (!durum.liste) return '';
    var ne = durum.sonGuncelleme ? saat(durum.sonGuncelleme) : '';
    var yas = veriYasi();
    var once = yas != null ? ' (' + sureYaz(yas) + ' önce)' : '';
    if (durum.hata || durum.bayat) {
      return 'ŞUKOB\'dan şu an güncel fiyat alınamıyor. Gösterilen fiyatlar ' +
        (ne ? ne + once + ' itibarıyla ' : '') + 'son bilinen fiyatlardır. Güncel fiyat için lütfen bizi arayın.';
    }
    if (yas != null && yas > ESKI_DK * 60) {
      return 'Fiyatlar ' + sureDir(yas) + ' güncellenmedi (son güncelleme ' + ne +
        '). Güncel fiyat için lütfen bizi arayın.';
    }
    return '';
  }

  // "5 dakikadır", "2 saattir", "3 gündür"
  function sureDir(sn) {
    var s = sureYaz(sn);
    return s + (/saat$/.test(s) ? 'tir' : /gün$/.test(s) ? 'dür' : 'dır');
  }

  function uyariVar() { return !!uyariMetni(); }

  function yon(eski, yeni) {
    if (eski == null || yeni == null || eski === yeni) return null;
    return yeni > eski ? 'yukari' : 'asagi';
  }

  function olay(ad, detay) {
    var e;
    try {
      e = new CustomEvent(ad, { detail: detay });
    } catch (x) {
      e = document.createEvent('CustomEvent');
      e.initCustomEvent(ad, false, false, detay);
    }
    document.dispatchEvent(e);
  }

  // Sekme arka plandayken bekle, öne gelince fiyat eskiyse hemen yenile
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimeout(zamanlayici);
    } else if (Date.now() - sonIstek >= YENILEME_MS) {
      cek();
    } else {
      zamanlayici = setTimeout(cek, YENILEME_MS - (Date.now() - sonIstek));
    }
  });

  /* ---------- Görünüm ---------- */

  function el(etiket, sinif, metin) {
    var e = document.createElement(etiket);
    if (sinif) e.className = sinif;
    if (metin != null) e.textContent = metin;
    return e;
  }

  function gruplariOku(kok) {
    var g = kok.getAttribute('data-gruplar');
    if (g) {
      return g.split('|').map(function (parca) {
        var i = parca.indexOf(':');
        return { baslik: parca.slice(0, i).trim(), kodlar: kodListesi(parca.slice(i + 1)) };
      });
    }
    return [{ baslik: '', kodlar: kodListesi(kok.getAttribute('data-kodlar')) }];
  }

  function kodListesi(s) {
    return s ? s.split(',').map(function (k) { return k.trim(); }).filter(Boolean) : null;
  }

  function bagla(kok) {
    if (kok.__fiyatTablosu) return;
    var t = { kok: kok, gruplar: gruplariOku(kok), govdeler: [], satirlar: {} };
    kok.__fiyatTablosu = t;
    kok.classList.add('ft');

    var ust = el('div', 'ft-ust');
    var baslik = kok.getAttribute('data-baslik');
    if (baslik) ust.appendChild(el('h3', 'ft-baslik', baslik));
    t.zaman = el('span', 'ft-zaman');
    ust.appendChild(t.zaman);

    t.uyari = el('p', 'ft-uyari-kutu');
    t.uyari.setAttribute('role', 'status');
    t.uyari.hidden = true;

    t.mesaj = el('p', 'ft-mesaj', 'Yükleniyor…');
    t.icerik = el('div', 'ft-gruplar');
    t.icerik.hidden = true;

    function basSatiri() {
      var bas = el('thead');
      var sat = el('tr');
      ['Ürün', 'Alış', 'Satış'].forEach(function (b) {
        var th = el('th', null, b);
        th.scope = 'col';
        sat.appendChild(th);
      });
      bas.appendChild(sat);
      return bas;
    }

    if (kok.getAttribute('data-duzen') === 'tek') {
      // Tek tablo: her grup kendi tbody'si, en üstünde grup başlığı satırı
      t.icerik.className = 'ft-gruplar ft-tek';
      var kutuT = el('div', 'ft-kutu');
      var tabloT = el('table', 'ft-tablo');
      tabloT.appendChild(basSatiri());
      t.gruplar.forEach(function (g) {
        var govdeT = el('tbody');
        if (g.baslik) {
          var gs = el('tr', 'ft-grup-satir');
          var gh = el('th', null, g.baslik);
          gh.colSpan = 3;
          gh.scope = 'colgroup';
          gs.appendChild(gh);
          govdeT.appendChild(gs);
        }
        tabloT.appendChild(govdeT);
        t.govdeler.push({ govde: govdeT, kodlar: g.kodlar });
      });
      kutuT.appendChild(tabloT);
      t.icerik.appendChild(kutuT);
    } else t.gruplar.forEach(function (g) {
      var kutu = el('div', 'ft-kutu');
      var tablo = el('table', 'ft-tablo');
      if (g.baslik) {
        var cap = el('caption', 'ft-grup', g.baslik);
        tablo.appendChild(cap);
      }
      var bas = el('thead');
      var sat = el('tr');
      ['Ürün', 'Alış', 'Satış'].forEach(function (b) {
        var th = el('th', null, b);
        th.scope = 'col';
        sat.appendChild(th);
      });
      bas.appendChild(sat);
      tablo.appendChild(bas);
      var govde = el('tbody');
      tablo.appendChild(govde);
      kutu.appendChild(tablo);
      t.icerik.appendChild(kutu);
      t.govdeler.push({ govde: govde, kodlar: g.kodlar });
    });

    kok.textContent = '';
    kok.appendChild(ust);
    kok.appendChild(t.uyari);
    kok.appendChild(t.mesaj);
    kok.appendChild(t.icerik);
    kok.appendChild(el('p', 'ft-kaynak', KAYNAK_YAZISI));

    tablolar.push(t);
    if (durum.liste || durum.hata) ciz(t, {});
  }

  function tumunuCiz(degisim) {
    tablolar.forEach(function (t) { ciz(t, degisim); });
  }

  function ciz(t, degisim) {
    // Üst satır: son güncelleme; sorun varsa belirgin uyarı kutusu
    t.zaman.textContent = durum.sonGuncelleme ? 'Son güncelleme: ' + saat(durum.sonGuncelleme) : '';
    var uyari = uyariMetni();
    t.zaman.className = 'ft-zaman' + (uyari ? ' ft-uyari' : '');
    if (t.uyari.textContent !== uyari) t.uyari.textContent = uyari;
    t.uyari.hidden = !uyari;

    if (!durum.liste) {
      t.mesaj.textContent = durum.hata ? 'Fiyatlar şu an alınamıyor' : 'Yükleniyor…';
      t.mesaj.className = 'ft-mesaj' + (durum.hata ? ' ft-hata' : '');
      t.mesaj.hidden = false;
      t.icerik.hidden = true;
      return;
    }
    t.mesaj.hidden = true;
    t.icerik.hidden = false;

    var kodla = {};
    durum.liste.forEach(function (o) { kodla[o.kod] = o; });

    t.govdeler.forEach(function (g) {
      var kodlar = g.kodlar || durum.liste.map(function (o) { return o.kod; });
      kodlar.forEach(function (kod) {
        var o = kodla[kod];
        var s = t.satirlar[kod];
        if (!o) {
          if (s) s.tr.hidden = true;
          return;
        }
        if (!s) {
          s = { tr: el('tr'), ad: el('th'), alis: el('td', 'ft-alis'), satis: el('td', 'ft-satis') };
          s.ad.scope = 'row';
          s.tr.appendChild(s.ad);
          s.tr.appendChild(s.alis);
          s.tr.appendChild(s.satis);
          t.satirlar[kod] = s;
        }
        g.govde.appendChild(s.tr); // sırayı korur
        s.tr.hidden = false;
        s.ad.textContent = o.ad;
        hucre(s.alis, bicimle(kod, o.alis), degisim[kod] && degisim[kod].alis);
        hucre(s.satis, bicimle(kod, o.satis), degisim[kod] && degisim[kod].satis);
        var d = degisim[kod] && (degisim[kod].satis || degisim[kod].alis);
        if (d) s.tr.setAttribute('data-yon', d);
      });
    });
  }

  function hucre(td, metin, yon) {
    td.textContent = metin;
    if (!yon) return;
    td.classList.remove('ft-yukari', 'ft-asagi');
    void td.offsetWidth; // animasyonu baştan başlat
    td.classList.add('ft-' + yon);
  }

  /* ---------- Başlat ---------- */

  function baslat() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-fiyat-tablosu]'), bagla);
    cek();
  }

  window.FiyatTablosu = {
    bagla: bagla,
    yenile: cek,
    veri: function () { return durum.liste; },
    kes: kes,
    bicimle: bicimle
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', baslat);
  else setTimeout(baslat, 0);
})();
