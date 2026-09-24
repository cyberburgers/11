/* =====================================================================
   SEVİLEN KUYUMCULUK — SİTE DAVRANIŞI
   Ayarlar için js/ayarlar.js dosyasına bakın; burayı değiştirmeniz
   gerekmez. Fiyatları js/fiyat-tablosu.js çeker; bu dosya aynı veriyi
   ('fiyatlar:guncellendi' olayı) vitrin ve hesaplama aracında kullanır.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.SEVILEN;
  var ONIZLEME = window.SEVILEN_ONIZLEME === true;
  var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  var FIYAT = {};   // kod -> { ad, kod, alis, satis, guncelleme }
  var SIRA = [];    // kaynaktan gelen sırayla kodlar

  /* ---------- Yardımcılar ---------- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var bicimler = {};
  function yaz(n, ondalik) {
    if (n == null || !isFinite(n)) return '—';
    var d = ondalik == null ? 2 : ondalik;
    if (!bicimler[d]) {
      bicimler[d] = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
    }
    return bicimler[d].format(n);
  }

  function saatYaz(t) {
    try {
      return new Date(t).toLocaleTimeString('tr-TR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Istanbul'
      });
    } catch (e) {
      return new Date(t).toLocaleTimeString('tr-TR');
    }
  }

  function sayiOku(s) {
    s = String(s || '').replace(/\s/g, '');
    if (!s) return null;
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : null;
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

    var buYil = new Date().getFullYear();
    $('#bu-yil').textContent = buYil;
    if (f.kurulusYili) $('#yil-sayi').textContent = buYil - f.kurulusYili;
  }

  /* ---------- Vitrin (üstteki öne çıkan fiyatlar) ---------- */

  function vitrinCiz() {
    var v = A.vitrin || {};
    $('#vitrin-ana').setAttribute('data-k', v.ana);
    var not = $('#vitrin-not');
    not.textContent = v.anaNot || '';
    not.hidden = !v.anaNot;
    $('#vitrin-yan').innerHTML = (v.yan || []).map(function (kod) {
      return '<li data-k="' + esc(kod) + '">' +
        '<span class="ad">—</span>' +
        '<span class="satir"><span>Alış</span><span data-alan="alis">—</span></span>' +
        '<span class="satir"><span>Satış</span><span data-alan="satis">—</span></span>' +
      '</li>';
    }).join('');
  }

  function parlat(el, yon) {
    el.classList.remove('yukari', 'asagi');
    void el.offsetWidth; // animasyonu yeniden başlat
    el.classList.add(yon);
  }

  function vitrinGuncelle(degisim) {
    var v = A.vitrin || {};
    var ana = FIYAT[v.ana];
    if (ana) $('#vitrin-ad').textContent = ana.ad;

    $$('#vitrin-ana, #vitrin-yan [data-k]').forEach(function (kutu) {
      var kod = kutu.getAttribute('data-k');
      var o = FIYAT[kod];
      var d = degisim[kod] || {};
      var ad = $('.ad', kutu);
      if (ad) ad.textContent = o ? o.ad : kod;
      ['alis', 'satis'].forEach(function (alan) {
        var h = $('[data-alan="' + alan + '"]', kutu);
        h.textContent = o ? window.FiyatTablosu.bicimle(kod, o[alan]) : '—';
        h.classList.toggle('bos', !o);
        if (d[alan]) parlat(h, d[alan]);
      });
      if (d.satis) kutu.setAttribute('data-yon', d.satis);
    });
  }

  function durumYaz(tip, zaman) {
    var metin = {
      bekliyor: 'Bağlanıyor',
      canli: 'Canlı',
      bayat: 'Son bilinen fiyat',
      ornek: 'Örnek fiyatlar',
      hata: 'Bağlantı yok'
    }[tip];
    if (zaman && tip !== 'hata') metin += ' · ' + saatYaz(zaman);
    $$('[data-durum]').forEach(function (el) {
      el.setAttribute('data-tip', tip);
      el.textContent = metin;
    });
  }

  document.addEventListener('fiyatlar:guncellendi', function (e) {
    var d = e.detail;
    FIYAT = {};
    SIRA = [];
    d.liste.forEach(function (o) { FIYAT[o.kod] = o; SIRA.push(o.kod); });
    var ornek = !!(window.FIYAT_TABLOSU && window.FIYAT_TABLOSU.ornekVeri);
    $('#ornek-uyari').hidden = !ornek;
    durumYaz(ornek ? 'ornek' : d.bayat ? 'bayat' : 'canli', d.sonGuncelleme);
    vitrinGuncelle(d.degisim || {});
    hesapSecenekleri();
    hesapla();
  });

  document.addEventListener('fiyatlar:hata', function () {
    durumYaz('hata');
  });

  /* ---------- Hesaplama ---------- */

  var hForm, hUrun, hMiktar, hBirim, hTutar, hDetay;
  var hSecenekKodlari = '';

  function hesapKur() {
    hForm = $('#hesap-form');
    hUrun = $('#h-urun');
    hMiktar = $('#h-miktar');
    hBirim = $('#h-birim');
    hTutar = $('#h-tutar');
    hDetay = $('#h-detay');

    hUrun.innerHTML = '<option value="">Fiyatlar yükleniyor…</option>';
    hForm.addEventListener('submit', function (e) { e.preventDefault(); });
    hForm.addEventListener('input', hesapla);
    hForm.addEventListener('change', hesapla);
    hesapla();
  }

  // Ürün listesi fiyatlardan gelir; liste değişmedikçe seçim korunur
  function hesapSecenekleri() {
    var kodlar = SIRA.join(',');
    if (kodlar === hSecenekKodlari) return;
    hSecenekKodlari = kodlar;
    var secili = hUrun.value || (FIYAT.yeni_ceyrek ? 'yeni_ceyrek' : SIRA[0]);
    hUrun.innerHTML = SIRA.map(function (kod) {
      return '<option value="' + esc(kod) + '">' + esc(FIYAT[kod].ad) + '</option>';
    }).join('');
    hUrun.value = FIYAT[secili] ? secili : SIRA[0];
  }

  function hesapla() {
    if (!hForm) return;
    var o = FIYAT[hUrun.value];
    var birim = (A.birimler && A.birimler[hUrun.value]) || 'adet';
    hBirim.textContent = birim;
    hTutar.classList.add('bos');
    hTutar.textContent = '—';

    if (!o) {
      hDetay.textContent = 'Fiyatlar yüklenince hesaplama yapılabilir.';
      return;
    }
    var miktar = sayiOku(hMiktar.value);
    if (miktar == null || miktar <= 0) {
      hDetay.textContent = 'Geçerli bir miktar girin, örneğin 2 ya da 12,5.';
      return;
    }
    var al = $('#h-al').checked;
    // Ekranda görünen (kesilmiş) fiyatla hesapla ki müşterinin kendi hesabı tutsun
    var fiyat = window.FiyatTablosu.kes(o.kod, al ? o.satis : o.alis);
    if (fiyat == null) {
      hDetay.textContent = 'Bu ürünün fiyatı şu an alınamıyor.';
      return;
    }

    hTutar.classList.remove('bos');
    var tutar = miktar * fiyat;
    hTutar.textContent = yaz(tutar, Math.abs(tutar - Math.round(tutar)) < 0.005 ? 0 : 2);
    var parabirimi = birim === 'USD' || birim === 'EUR';
    var miktarYazi = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 3 }).format(miktar) + ' ' + birim + (parabirimi ? '' : ' ' + o.ad);
    var detay = miktarYazi + ' × ' + window.FiyatTablosu.bicimle(o.kod, fiyat) + ' ₺ · ' + (al ? 'satış' : 'alış') + ' fiyatı';
    if ((A.iscilikli || []).indexOf(o.kod) > -1) detay += ' · işçilik hariç';
    hDetay.textContent = detay;
  }

  /* ---------- Çalışma saatleri ---------- */

  function dakika(s) {
    var p = s.split(':');
    return +p[0] * 60 + +p[1];
  }

  function saatleriCiz() {
    var cs = A.firma.calismaSaatleri || {};
    var sira = [1, 2, 3, 4, 5, 6, 0];
    var gruplar = [];
    sira.forEach(function (g) {
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
      var parcalar = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Istanbul', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var p = {};
      parcalar.forEach(function (x) { p[x.type] = x.value; });
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

  /* ---------- Harita ---------- */

  function haritaKur() {
    var kutu = $('#harita');
    var sorgu = encodeURIComponent(A.firma.haritaArama);
    if (ONIZLEME) {
      kutu.innerHTML =
        '<div class="harita-yedek">' +
          '<p>Harita, site yayına alındığında burada görünecek.</p>' +
          '<a class="dugme dugme-cizgi" href="https://www.google.com/maps/search/?api=1&query=' + sorgu + '" target="_blank" rel="noopener">Google Haritalar\'da aç</a>' +
        '</div>';
      return;
    }
    var f = document.createElement('iframe');
    f.src = 'https://maps.google.com/maps?q=' + sorgu + '&z=16&output=embed';
    f.loading = 'lazy';
    f.title = 'Harita: ' + A.firma.adres;
    f.referrerPolicy = 'no-referrer-when-downgrade';
    kutu.appendChild(f);
  }

  /* ---------- Giyoş deseni (kadran ve banknotlardaki ince oyma) ---------- */

  function giyosCiz() {
    var c = $('.giyos');
    if (!c || !c.getContext) return;
    var kutu = c.getBoundingClientRect();
    if (!kutu.width || !kutu.height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.round(kutu.width * dpr);
    c.height = Math.round(kutu.height * dpr);
    var x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, kutu.width, kutu.height);

    var genis = kutu.width > 920;
    var cx = genis ? kutu.width * 0.76 : kutu.width * 0.92;
    var cy = genis ? kutu.height * 0.5 : kutu.height * 0.2;
    var R = genis ? Math.min(kutu.height * 0.58, 440) : Math.min(kutu.width * 0.62, 320);

    // Desenin rengi ve yoğunluğu temadan gelir (css/site.css → --giyos-*)
    var stil = getComputedStyle(document.documentElement);
    var renk = stil.getPropertyValue('--giyos-renk').trim() || '201, 165, 92';
    var guc = parseFloat(stil.getPropertyValue('--giyos-guc')) || 1;
    function a(alfa) { return Math.min(1, alfa * guc).toFixed(3); }

    function halka(yaricap, k, d, faz, alfa) {
      x.strokeStyle = 'rgba(' + renk + ', ' + alfa + ')';
      x.beginPath();
      var N = 1800;
      for (var i = 0; i <= N; i++) {
        var t = (i / N) * Math.PI * 2;
        var px = cx + yaricap * ((1 - d) * Math.cos(t) + d * Math.cos(k * t + faz));
        var py = cy + yaricap * ((1 - d) * Math.sin(t) - d * Math.sin(k * t + faz));
        if (i) x.lineTo(px, py); else x.moveTo(px, py);
      }
      x.stroke();
    }

    x.lineWidth = 0.6;
    for (var m = 0; m < 7; m++) halka(R * (1 - m * 0.028), 41, 0.07, m * 0.45, a(0.2 - m * 0.018));
    for (var n = 0; n < 5; n++) halka(R * (0.66 - n * 0.03), 29, 0.11, n * 0.6, a(0.14 - n * 0.02));
    x.lineWidth = 0.8;
    x.strokeStyle = 'rgba(' + renk + ', ' + a(0.12) + ')';
    x.beginPath(); x.arc(cx, cy, R * 1.1, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.arc(cx, cy, R * 0.44, 0, Math.PI * 2); x.stroke();
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
    // Başka sekmede tema değişirse bu sekme de uysun
    window.addEventListener('storage', function (e) {
      if (e.key === TEMA_ANAHTAR) temaUygula(e.newValue === 'koyu' ? 'koyu' : 'acik', false);
    });
  }

  /* ---------- Mobil menü ---------- */

  function menuKur() {
    var dugme = $('#menu-dugme');
    var menu = $('#mobil-menu');

    function ac(acik) {
      menu.hidden = !acik;
      dugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
    }

    dugme.addEventListener('click', function () { ac(menu.hidden); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) ac(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) {
        ac(false);
        dugme.focus();
      }
    });
    if (window.matchMedia) {
      var genis = window.matchMedia('(min-width: 861px)');
      var kapat = function (m) { if (m.matches) ac(false); };
      if (genis.addEventListener) genis.addEventListener('change', kapat);
      else if (genis.addListener) genis.addListener(kapat);
    }
  }

  /* ---------- Google için işletme bilgisi (yapısal veri) ---------- */

  function yapisalVeri() {
    var f = A.firma;
    var gunler = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var saatler = [];
    Object.keys(f.calismaSaatleri || {}).forEach(function (g) {
      var s = f.calismaSaatleri[g];
      if (s) {
        saatler.push({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'https://schema.org/' + gunler[g],
          opens: s[0],
          closes: s[1]
        });
      }
    });
    var veri = {
      '@context': 'https://schema.org',
      '@type': 'JewelryStore',
      name: f.ad,
      url: location.origin + location.pathname,
      image: new URL('img/paylasim.jpg', location.href).href,
      telephone: f.telefonArama,
      address: {
        '@type': 'PostalAddress',
        streetAddress: f.adres,
        addressLocality: f.sehir || '',
        addressCountry: 'TR'
      },
      openingHoursSpecification: saatler
    };
    if (f.instagram) veri.sameAs = ['https://instagram.com/' + f.instagram];
    if (f.kurulusYili) veri.foundingDate = String(f.kurulusYili);

    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(veri);
    document.head.appendChild(s);
  }

  /* ---------- Başlat ---------- */

  temaKur();
  menuKur();
  firmaDoldur();
  if (!ONIZLEME) yapisalVeri();
  vitrinCiz();
  hesapKur();
  saatleriCiz();
  acikDurum();
  setInterval(acikDurum, 60000);
  haritaKur();
  giyosCiz();

  var boyutZaman;
  window.addEventListener('resize', function () {
    clearTimeout(boyutZaman);
    boyutZaman = setTimeout(giyosCiz, 150);
  });

})();
