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
  var KAYNAK_YAZISI = 'Kaynak: Şanlıurfa Kuyumcular Odası tavsiye fiyatları. Bilgi amaçlıdır, yatırım tavsiyesi değildir.';

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

  function cek() {
    clearTimeout(zamanlayici);
    sonIstek = Date.now();

    var istek;
    if (typeof AYAR.ornekVeri === 'function') {
      istek = Promise.resolve({ liste: AYAR.ornekVeri(), bayat: false });
    } else {
      var ayrac = ADRES.indexOf('?') > -1 ? '&' : '?';
      istek = fetch(ADRES + ayrac + 't=' + Date.now(), { cache: 'no-store', headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          var bayat = r.headers.get('X-Fiyat-Durumu') === 'bayat';
          return r.json().then(function (liste) { return { liste: liste, bayat: bayat }; });
        });
    }

    istek
      .then(function (s) {
        if (!Array.isArray(s.liste) || !s.liste.length) throw new Error('Boş yanıt');
        basarili(s.liste, s.bayat);
      })
      .catch(function () {
        durum.hata = true;
        tumunuCiz({});
        olay('fiyatlar:hata', { liste: durum.liste });
      })
      .then(function () {
        if (!document.hidden) zamanlayici = setTimeout(cek, YENILEME_MS);
      });
  }

  function basarili(liste, bayat) {
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
    tumunuCiz(degisim);
    olay('fiyatlar:guncellendi', { liste: liste, degisim: degisim, bayat: bayat, sonGuncelleme: enYeni });
  }

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
    t.zaman.setAttribute('aria-live', 'polite');
    ust.appendChild(t.zaman);

    t.mesaj = el('p', 'ft-mesaj', 'Yükleniyor…');
    t.icerik = el('div', 'ft-gruplar');
    t.icerik.hidden = true;

    t.gruplar.forEach(function (g) {
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
    // Üst satır: son güncelleme / uyarı
    var zaman = durum.sonGuncelleme ? 'Son güncelleme: ' + saat(durum.sonGuncelleme) : '';
    if (durum.hata && durum.liste) {
      t.zaman.textContent = 'Fiyatlar şu an alınamıyor' + (zaman ? ' · ' + zaman : '');
      t.zaman.className = 'ft-zaman ft-uyari';
    } else if (durum.bayat) {
      t.zaman.textContent = zaman + ' · kaynağa şu an ulaşılamıyor';
      t.zaman.className = 'ft-zaman ft-uyari';
    } else {
      t.zaman.textContent = zaman;
      t.zaman.className = 'ft-zaman';
    }

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
