/* =====================================================================
   SEVİLEN KUYUMCULUK — SİTE DAVRANIŞI
   Ayarlar için js/ayarlar.js dosyasına bakın; burayı değiştirmeniz
   gerekmez.
   ===================================================================== */
(function () {
  'use strict';

  var A = window.SEVILEN;
  var ONIZLEME = window.SEVILEN_ONIZLEME === true;
  var GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  var KALEM = {};        // id -> kalem ayarı
  var SIRA = [];         // eşleştirme sırası
  var GUNCEL = {};       // id -> { alis, satis }
  var sonBasari = null;  // son başarılı güncelleme zamanı
  var sonDeneme = 0;
  var zamanlayici = null;
  var ornekZamanlayici = null;

  A.gruplar.forEach(function (g) {
    g.kalemler.forEach(function (k) {
      k.grup = g;
      KALEM[k.id] = k;
      SIRA.push(k);
    });
  });

  /* ---------- Yardımcılar ---------- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Türkçe karakterleri sadeleştirip büyük harfe çevirir: "Yeni Çeyrek" -> "YENI CEYREK"
  function sade(s) {
    return String(s || '')
      .toLocaleUpperCase('tr-TR')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim();
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

  /* ---------- Fiyat tabloları ---------- */

  function notHtml(k) {
    if (!k.not) return '';
    if (k.notTur === 'damga') return '<span class="damga" title="Ayar damgası (milyem)">' + esc(k.not) + '</span>';
    return '<span class="urun-not' + (k.notTur === 'kod' ? ' kod' : '') + '">' + esc(k.not) + '</span>';
  }

  function tablolariCiz() {
    var tablolar = $('#tablolar');
    var serit = $('#serit');
    var html = '';
    var seritHtml = '';

    A.gruplar.forEach(function (g) {
      if (g.gorunum === 'serit') {
        g.kalemler.forEach(function (k) {
          seritHtml +=
            '<div class="serit-oge" data-k="' + esc(k.id) + '">' +
              '<span class="serit-ad">' + esc(k.ad) + '</span>' +
              '<span class="serit-deger"><span class="kucuk">Alış</span><span data-alan="alis">—</span></span>' +
              '<span class="serit-deger"><span class="kucuk">Satış</span><span data-alan="satis">—</span></span>' +
            '</div>';
        });
        return;
      }
      html +=
        '<article class="tablo">' +
          '<header class="tablo-bas">' +
            '<h3 id="t-' + esc(g.id) + '">' + esc(g.baslik) + '</h3>' +
            '<span class="tablo-birim">' + esc(g.birimYazi || '') + '</span>' +
          '</header>' +
          '<table aria-labelledby="t-' + esc(g.id) + '">' +
            '<thead><tr><th scope="col">Ürün</th><th scope="col">Alış</th><th scope="col">Satış</th></tr></thead>' +
            '<tbody>' +
              g.kalemler.map(function (k) {
                return '<tr data-k="' + esc(k.id) + '">' +
                  '<th scope="row"><span class="urun"><span class="urun-ad">' + esc(k.ad) + '</span>' + notHtml(k) + '</span></th>' +
                  '<td data-alan="alis">—</td>' +
                  '<td data-alan="satis">—</td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
        '</article>';
    });

    if (seritHtml) {
      seritHtml += '<span class="serit-kaynak">Kaynak: ' + esc(A.fiyat.kaynakAdi) + ' tavsiye fiyatları</span>';
    }
    tablolar.innerHTML = html;
    serit.innerHTML = seritHtml;
  }

  function vitrinCiz() {
    var ana = KALEM[A.vitrin.ana];
    if (ana) {
      $('#vitrin-ana').setAttribute('data-k', ana.id);
      $('#vitrin-ad').textContent = ana.ad;
      var not = $('#vitrin-not');
      not.textContent = ana.not || '';
      not.hidden = !ana.not;
      not.className = ana.notTur === 'damga' ? 'damga' : 'urun-not';
    }
    $('#vitrin-yan').innerHTML = (A.vitrin.yan || []).filter(function (id) { return KALEM[id]; }).map(function (id) {
      return '<li data-k="' + esc(id) + '">' +
        '<span class="ad">' + esc(KALEM[id].ad) + '</span>' +
        '<span class="satir"><span>Alış</span><span data-alan="alis">—</span></span>' +
        '<span class="satir"><span>Satış</span><span data-alan="satis">—</span></span>' +
      '</li>';
    }).join('');
  }

  /* ---------- Kaynak verisini listeyle eşleştirme ---------- */

  function eslestir(kaynak) {
    var liste = kaynak.map(function (s) {
      return { alis: s.alis, satis: s.satis, n: ' ' + sade(s.ad) + ' ', ham: sade(s.ad) };
    });
    var kullanildi = [];
    var sonuc = {};

    function uygun(s, kelimeler, haric) {
      if (kullanildi.indexOf(s) > -1) return false;
      for (var i = 0; i < kelimeler.length; i++) if (s.n.indexOf(' ' + kelimeler[i] + ' ') < 0) return false;
      for (var j = 0; j < haric.length; j++) if (s.n.indexOf(' ' + haric[j] + ' ') > -1) return false;
      return true;
    }

    SIRA.forEach(function (k) {
      var bulunan = null;
      if (k.kaynakAdi) {
        var hedef = sade(k.kaynakAdi);
        bulunan = liste.filter(function (s) { return s.ham === hedef; })[0] || null;
      } else {
        var haric = (k.haric || []).map(sade);
        var alternatifler = k.eslesme || [];
        for (var a = 0; a < alternatifler.length && !bulunan; a++) {
          var kelimeler = sade(alternatifler[a]).split(' ');
          bulunan = liste.filter(function (s) { return uygun(s, kelimeler, haric); })[0] || null;
        }
      }
      if (!bulunan) return;
      kullanildi.push(bulunan);
      sonuc[k.id] = {
        alis: bulunan.alis > 0 ? bulunan.alis + (k.alisFark || 0) : null,
        satis: bulunan.satis > 0 ? bulunan.satis + (k.satisFark || 0) : null
      };
    });
    return sonuc;
  }

  /* ---------- Ekrana yazma ---------- */

  function parlat(el, yon) {
    el.classList.remove('yukari', 'asagi');
    void el.offsetWidth; // animasyonu yeniden başlat
    el.classList.add(yon);
  }

  function uygula(kaynak) {
    var yeni = eslestir(kaynak);

    Object.keys(KALEM).forEach(function (id) {
      var k = KALEM[id];
      var v = yeni[id] || { alis: null, satis: null };
      var eski = GUNCEL[id];

      $$('[data-k="' + id + '"]').forEach(function (kutu) {
        ['alis', 'satis'].forEach(function (alan) {
          var hucre = $('[data-alan="' + alan + '"]', kutu);
          if (!hucre) return;
          var deger = v[alan];
          var metin = yaz(deger, k.ondalik);
          if (k.onEk && deger != null) metin = k.onEk + metin;
          hucre.textContent = metin;
          hucre.classList.toggle('bos', deger == null);
          if (eski && eski[alan] != null && deger != null && deger !== eski[alan]) {
            parlat(hucre, deger > eski[alan] ? 'yukari' : 'asagi');
          }
        });
        if (eski && eski.satis != null && v.satis != null && v.satis !== eski.satis) {
          kutu.setAttribute('data-yon', v.satis > eski.satis ? 'yukari' : 'asagi');
        }
      });
      GUNCEL[id] = v;
    });

    hesapla();
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

    var alt = '';
    if (tip === 'canli' || tip === 'ornek') alt = A.fiyat.yenilemeSaniye + ' saniyede bir yenilenir';
    if (tip === 'bayat') alt = 'Kaynağa şu an ulaşılamıyor, en son alınan fiyatlar gösteriliyor';
    if (tip === 'hata') {
      alt = sonBasari
        ? 'Son başarılı güncelleme ' + saatYaz(sonBasari) + '. Güncel fiyat için bizi arayın.'
        : 'Fiyatlar şu an alınamıyor. Güncel fiyat için bizi arayın.';
    }
    $('#guncelleme').textContent = alt;
  }

  /* ---------- Fiyat çekme ---------- */

  function ornekIzinli() {
    if (ONIZLEME) return true;
    if (A.fiyat.ornekFiyat !== 'otomatik') return false;
    var h = location.hostname;
    return location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '';
  }

  function cek() {
    clearTimeout(zamanlayici);
    sonDeneme = Date.now();
    var ayrac = A.fiyat.adres.indexOf('?') > -1 ? '&' : '?';

    fetch(A.fiyat.adres + ayrac + 't=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok || !j.kalemler || !j.kalemler.length) throw new Error((j && j.hata) || 'Boş yanıt');
        sonBasari = j.guncelleme || new Date().toISOString();
        uygula(j.kalemler);
        durumYaz(j.bayat ? 'bayat' : 'canli', sonBasari);
      })
      .catch(function () {
        if (ornekIzinli()) { ornekBaslat(); return; }
        durumYaz('hata');
      })
      .then(function () {
        if (!ornekZamanlayici) zamanlayici = setTimeout(cek, A.fiyat.yenilemeSaniye * 1000);
      });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden || ornekZamanlayici) return;
    if (Date.now() - sonDeneme > A.fiyat.yenilemeSaniye * 1000) cek();
  });

  /* ---------- Örnek fiyatlar (yalnızca önizleme) ---------- */

  var ornek = { ons: 4150, usd: 47.2, gumusOns: 48.4 };

  function ornekUret(ilk) {
    if (!ilk) {
      ornek.ons *= 1 + (Math.random() - 0.5) * 0.0016;
      ornek.usd *= 1 + (Math.random() - 0.5) * 0.0005;
      ornek.gumusOns *= 1 + (Math.random() - 0.5) * 0.002;
    }
    var has = ornek.ons * ornek.usd / 31.1035;
    var gumus = ornek.gumusOns * ornek.usd / 31.1035;
    var u = ornek.usd;
    function s(ad, a, b) { return { ad: ad, alis: Math.round(a * 100) / 100, satis: Math.round(b * 100) / 100 }; }
    return [
      s('HAS ALTIN', has * 0.997, has * 1.004),
      s('GRAM ALTIN', has * 0.995, has * 1.012),
      s('22 AYAR BİLEZİK', has * 0.912, has * 0.948),
      s('18 AYAR', has * 0.715, has * 0.79),
      s('14 AYAR', has * 0.555, has * 0.65),
      s('YENİ ÇEYREK', has * 1.606, has * 1.642),
      s('ESKİ ÇEYREK', has * 1.59, has * 1.625),
      s('YENİ YARIM', has * 3.212, has * 3.284),
      s('ESKİ YARIM', has * 3.18, has * 3.25),
      s('YENİ TAM', has * 6.424, has * 6.568),
      s('ESKİ TAM', has * 6.36, has * 6.5),
      s('YENİ ATA', has * 6.61, has * 6.76),
      s('ESKİ ATA', has * 6.56, has * 6.7),
      s('YENİ GREMSE', has * 16.06, has * 16.42),
      s('ESKİ GREMSE', has * 15.9, has * 16.25),
      s('USD', u * 0.9975, u * 1.0035),
      s('EUR', u * 1.168, u * 1.176),
      s('GBP', u * 1.338, u * 1.352),
      s('CHF', u * 1.244, u * 1.262),
      s('SAR', u / 3.75 * 0.985, u / 3.75 * 1.02),
      s('GÜMÜŞ', gumus * 0.97, gumus * 1.06),
      s('ONS', ornek.ons - 0.6, ornek.ons + 0.6)
    ];
  }

  function ornekBaslat() {
    if (ornekZamanlayici) return;
    clearTimeout(zamanlayici);
    $('#ornek-uyari').hidden = false;
    uygula(ornekUret(true));
    durumYaz('ornek', new Date());
    ornekZamanlayici = setInterval(function () {
      uygula(ornekUret(false));
      durumYaz('ornek', new Date());
    }, 4000);
  }

  /* ---------- Hesaplama ---------- */

  var hForm, hUrun, hMiktar, hBirim, hTutar, hDetay;

  function hesapKur() {
    hForm = $('#hesap-form');
    hUrun = $('#h-urun');
    hMiktar = $('#h-miktar');
    hBirim = $('#h-birim');
    hTutar = $('#h-tutar');
    hDetay = $('#h-detay');

    hUrun.innerHTML = A.gruplar.map(function (g) {
      var secenekler = g.kalemler.filter(function (k) { return k.hesapla !== false; });
      if (!secenekler.length) return '';
      return '<optgroup label="' + esc(g.baslik) + '">' +
        secenekler.map(function (k) {
          return '<option value="' + esc(k.id) + '">' + esc(k.ad) + '</option>';
        }).join('') +
      '</optgroup>';
    }).join('');
    if (KALEM.ceyrek) hUrun.value = 'ceyrek';

    hForm.addEventListener('submit', function (e) { e.preventDefault(); });
    hForm.addEventListener('input', hesapla);
    hForm.addEventListener('change', hesapla);
    hesapla();
  }

  function hesapla() {
    if (!hForm) return;
    var k = KALEM[hUrun.value];
    if (!k) return;
    var birim = k.birim || 'adet';
    hBirim.textContent = birim;

    var miktar = sayiOku(hMiktar.value);
    var al = $('#h-al').checked;
    var v = GUNCEL[k.id];
    var fiyat = v ? (al ? v.satis : v.alis) : null;

    hTutar.classList.remove('bos');
    if (miktar == null || miktar <= 0) {
      hTutar.textContent = '—';
      hTutar.classList.add('bos');
      hDetay.textContent = 'Geçerli bir miktar girin, örneğin 2 ya da 12,5.';
      return;
    }
    if (fiyat == null) {
      hTutar.textContent = '—';
      hTutar.classList.add('bos');
      hDetay.textContent = 'Bu ürünün fiyatı şu an alınamıyor.';
      return;
    }

    hTutar.textContent = yaz(miktar * fiyat, 2);
    var miktarYazi = yaz(miktar, miktar % 1 ? 2 : 0) + ' ' + birim;
    if (k.notTur !== 'kod') miktarYazi += ' ' + k.ad;
    var detay = miktarYazi + ' × ' + yaz(fiyat, k.ondalik) + ' ₺ · ' + (al ? 'satış' : 'alış') + ' fiyatı';
    if (k.notTur === 'damga' && k.not !== '995') detay += ' · işçilik hariç';
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
  var TEMA_RENGI = { acik: '#F5EFE3', koyu: '#0B2A22' };
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
  tablolariCiz();
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

  if (ONIZLEME) ornekBaslat();
  else cek();
})();
