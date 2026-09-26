/* =====================================================================
   SEVİLEN KUYUMCULUK — SİTE DAVRANIŞI
   Ayarlar için js/ayarlar.js dosyasına bakın; burayı değiştirmeniz
   gerekmez. Fiyatları js/fiyat-tablosu.js çeker; bu dosya iletişim
   bilgilerini, saati, temayı ve fiyat durum rozetini yönetir.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.SEVILEN;
  var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function saatYaz(t, saniyeli) {
    var s = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' };
    if (saniyeli !== false) s.second = '2-digit';
    try {
      return new Date(t).toLocaleTimeString('tr-TR', s);
    } catch (e) {
      return new Date(t).toLocaleTimeString('tr-TR');
    }
  }

  /* ---------- Firma bilgileri ---------- */

  function firmaDoldur() {
    var f = A.firma;
    $$('[data-firma]').forEach(function (el) {
      var v = f[el.getAttribute('data-firma')];
      if (v != null) el.textContent = v;
    });
    $$('[data-tel]').forEach(function (el) { el.href = 'tel:' + f.telefonArama; });
    $$('[data-wa]').forEach(function (el) {
      el.href = 'https://wa.me/' + f.whatsapp + '?text=' + encodeURIComponent(f.whatsappMesaj || '');
      el.target = '_blank';
      el.rel = 'noopener';
    });
    $$('[data-ig]').forEach(function (el) {
      el.href = 'https://instagram.com/' + f.instagram;
      el.target = '_blank';
      el.rel = 'noopener';
      el.textContent = '@' + f.instagram;
    });
    $$('[data-yol]').forEach(function (el) {
      el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f.haritaArama);
    });
    $('#bu-yil').textContent = new Date().getFullYear();
  }

  /* ---------- Canlı saat (Türkiye saati) ---------- */

  // Karşılama: saate göre "Hayırlı sabahlar / günler / akşamlar / geceler"
  function selamYaz(simdi) {
    var el = $('#selam');
    if (!el) return;
    var s = parseInt(saatYaz(simdi, false), 10);
    var metin = s >= 5 && s < 11 ? 'Hayırlı sabahlar'
              : s >= 11 && s < 17 ? 'Hayırlı günler'
              : s >= 17 && s < 22 ? 'Hayırlı akşamlar'
              : 'Hayırlı geceler';
    if (el.textContent !== metin) el.textContent = metin;
  }

  function saatiGuncelle() {
    var simdi = new Date();
    $('#saat').textContent = saatYaz(simdi);
    selamYaz(simdi);
    try {
      $('#tarih').textContent = simdi.toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul'
      });
    } catch (e) {
      $('#tarih').textContent = simdi.toLocaleDateString('tr-TR');
    }
  }

  /* ---------- Fiyat durum rozeti ---------- */

  function durumYaz(tip, zaman) {
    var metin = {
      bekliyor: 'Bağlanıyor',
      canli: 'Canlı',
      bayat: 'Son bilinen fiyat',
      eski: 'Güncel değil',
      ornek: 'Örnek fiyatlar',
      hata: 'Bağlantı yok'
    }[tip];
    if (zaman && tip !== 'hata') metin += ' · ' + saatYaz(zaman, false);
    $$('[data-durum]').forEach(function (el) {
      el.setAttribute('data-tip', tip);
      el.textContent = metin;
    });
  }

  document.addEventListener('fiyatlar:guncellendi', function (e) {
    var d = e.detail;
    var ornek = !!(window.FIYAT_TABLOSU && window.FIYAT_TABLOSU.ornekVeri);
    $('#ornek-uyari').hidden = !ornek;
    durumYaz(ornek ? 'ornek' : d.bayat ? 'bayat' : d.eski ? 'eski' : 'canli', d.sonGuncelleme);
  });

  document.addEventListener('fiyatlar:hata', function () {
    durumYaz('hata');
  });

  /* ---------- Çalışma saatleri ---------- */

  function dakika(s) {
    var p = s.split(':');
    return +p[0] * 60 + +p[1];
  }

  function saatleriCiz() {
    var cs = A.firma.calismaSaatleri || {};
    var gruplar = [];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (g) {
      var deger = cs[g] ? cs[g][0] + ' – ' + cs[g][1] : 'Kapalı';
      var son = gruplar[gruplar.length - 1];
      if (son && son.deger === deger) son.bitis = g;
      else gruplar.push({ baslangic: g, bitis: g, deger: deger });
    });
    $('#saatler').innerHTML = gruplar.map(function (gr) {
      var gunler = gr.baslangic === gr.bitis ? GUNLER[gr.baslangic] : GUNLER[gr.baslangic] + ' – ' + GUNLER[gr.bitis];
      return '<li' + (gr.deger === 'Kapalı' ? ' class="kapali"' : '') + '><span>' + gunler + '</span><span>' + gr.deger + '</span></li>';
    }).join('');
  }

  function acikDurum() {
    var el = $('#acik-durum');
    var cs = A.firma.calismaSaatleri;
    if (!cs) return;
    try {
      var p = {};
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var gun = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
      var simdi = +p.hour * 60 + +p.minute;
      var bugun = cs[gun];
      var acik = !!bugun && simdi >= dakika(bugun[0]) && simdi < dakika(bugun[1]);
      el.setAttribute('data-acik', acik ? 'evet' : 'hayir');
      el.textContent = acik ? 'Şu an açık · kapanış ' + bugun[1] : 'Şu an kapalı';
      el.hidden = false;
    } catch (e) {
      el.hidden = true;
    }
  }

  /* ---------- Arka plan deseni (giyoş: saat kadranı ve banknot oyması) ---------- */

  function giyosCiz() {
    var c = $('.giyos');
    if (!c || !c.getContext) return;
    var w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(w * dpr);
    c.height = Math.round(h * dpr);
    var x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);

    // Renk ve yoğunluk temadan gelir (css/site.css → --giyos-*)
    var stil = getComputedStyle(document.documentElement);
    var renk = stil.getPropertyValue('--giyos-renk').trim() || '176, 138, 69';
    var guc = parseFloat(stil.getPropertyValue('--giyos-guc')) || 0.7;
    function a(alfa) { return Math.min(1, alfa * guc).toFixed(3); }

    function halka(cx, cy, r, k, d, faz, alfa) {
      x.strokeStyle = 'rgba(' + renk + ', ' + a(alfa) + ')';
      x.beginPath();
      var N = 1600;
      for (var i = 0; i <= N; i++) {
        var t = (i / N) * Math.PI * 2;
        var px = cx + r * ((1 - d) * Math.cos(t) + d * Math.cos(k * t + faz));
        var py = cy + r * ((1 - d) * Math.sin(t) - d * Math.sin(k * t + faz));
        if (i) x.lineTo(px, py); else x.moveTo(px, py);
      }
      x.stroke();
    }

    function rozet(cx, cy, R) {
      x.lineWidth = 0.6;
      for (var m = 0; m < 6; m++) halka(cx, cy, R * (1 - m * 0.03), 41, 0.07, m * 0.45, 0.2 - m * 0.02);
      for (var n = 0; n < 4; n++) halka(cx, cy, R * (0.64 - n * 0.03), 29, 0.11, n * 0.6, 0.13 - n * 0.02);
      x.lineWidth = 0.8;
      x.strokeStyle = 'rgba(' + renk + ', ' + a(0.1) + ')';
      x.beginPath(); x.arc(cx, cy, R * 1.1, 0, Math.PI * 2); x.stroke();
    }

    // İki köşede birer desen: sağ üst büyük, sol alt küçük
    var kisa = Math.min(w, h);
    if (w > 900) {
      rozet(w * 0.93, h * 0.12, kisa * 0.42);
      rozet(w * 0.05, h * 0.9, kisa * 0.3);
    } else {
      rozet(w * 0.98, h * 0.04, w * 0.55);
    }
  }

  function giyosKur() {
    var zaman;
    function yeniden() { clearTimeout(zaman); zaman = setTimeout(giyosCiz, 120); }
    window.addEventListener('resize', yeniden);
    // Tablo yüklenince bölümün yüksekliği değişir; deseni ona göre yeniden çiz
    if (window.ResizeObserver) new ResizeObserver(yeniden).observe($('.pano'));
    giyosCiz();
  }

  /* ---------- Açık / koyu tema ---------- */

  var TEMA_ANAHTAR = 'sevilen-tema';
  var TEMA_RENGI = { acik: '#FFFFFF', koyu: '#0B2A22' };
  var temaGecisZaman;

  function simdikiTema() {
    return document.documentElement.getAttribute('data-tema') === 'koyu' ? 'koyu' : 'acik';
  }

  function temaDugmesiniGuncelle() {
    var koyu = simdikiTema() === 'koyu';
    var d = $('#tema-dugme');
    d.setAttribute('aria-pressed', koyu ? 'true' : 'false');
    d.title = koyu ? 'Açık temaya geç' : 'Koyu temaya geç';
  }

  function temaUygula(tema, yumusak) {
    var kok = document.documentElement;
    var azHareket = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (yumusak && !azHareket) {
      kok.classList.add('tema-gecis');
      clearTimeout(temaGecisZaman);
      temaGecisZaman = setTimeout(function () { kok.classList.remove('tema-gecis'); }, 420);
    }
    kok.setAttribute('data-tema', tema);
    var meta = document.getElementById('tema-rengi');
    if (meta) meta.setAttribute('content', TEMA_RENGI[tema]);
    temaDugmesiniGuncelle();
    giyosCiz();
  }

  function temaKur() {
    temaDugmesiniGuncelle();
    $('#tema-dugme').addEventListener('click', function () {
      var yeni = simdikiTema() === 'koyu' ? 'acik' : 'koyu';
      try { localStorage.setItem(TEMA_ANAHTAR, yeni); } catch (e) {}
      temaUygula(yeni, true);
    });
    window.addEventListener('storage', function (e) {
      if (e.key === TEMA_ANAHTAR) temaUygula(e.newValue === 'koyu' ? 'koyu' : 'acik', false);
    });
  }

  /* ---------- Google için işletme bilgisi (yapısal veri) ---------- */

  function yapisalVeri() {
    var f = A.firma;
    var gunler = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var saatler = [];
    Object.keys(f.calismaSaatleri || {}).forEach(function (g) {
      var s = f.calismaSaatleri[g];
      if (s) {
        saatler.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: 'https://schema.org/' + gunler[g], opens: s[0], closes: s[1] });
      }
    });
    var veri = {
      '@context': 'https://schema.org',
      '@type': 'JewelryStore',
      name: f.ad,
      url: location.origin + location.pathname,
      image: new URL('img/paylasim.jpg', location.href).href,
      telephone: f.telefonArama,
      address: { '@type': 'PostalAddress', streetAddress: f.adres, addressLocality: f.sehir || '', addressCountry: 'TR' },
      openingHoursSpecification: saatler
    };
    if (f.instagram) veri.sameAs = ['https://instagram.com/' + f.instagram];
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(veri);
    document.head.appendChild(s);
  }

  /* ---------- Başlat ---------- */

  temaKur();
  giyosKur();
  firmaDoldur();
  if (window.SEVILEN_ONIZLEME !== true) yapisalVeri();
  saatiGuncelle();
  setInterval(saatiGuncelle, 1000);
  saatleriCiz();
  acikDurum();
  setInterval(acikDurum, 60000);
})();
