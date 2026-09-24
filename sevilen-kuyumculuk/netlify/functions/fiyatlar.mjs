/* =====================================================================
   SEVİLEN KUYUMCULUK — FİYAT UÇ NOKTASI (NETLIFY FUNCTIONS)
   api/fiyatlar.php ile aynı işi yapar; site Netlify'da çalışırken
   /api/fiyatlar.php adresi bu fonksiyona gelir.

   Çıktı: [{"ad","kod","alis","satis","guncelleme"}, ...]
   Başlıklar: X-Fiyat-Durumu: taze | bayat, X-Fiyat-Yasi: saniye
   Hiç veri yoksa: 502 {"hata":"Fiyatlar alınamadı"}
   Kurulum testi: /api/tani

   Önbellek üç katmanlı:
   1) Netlify CDN cevabı onbellekSn boyunca saklar (fonksiyon çağrılmaz).
   2) Sıcak fonksiyon belleği.
   3) Netlify Blobs: son başarılı veri ve son hata (kalıcı).
   Ayarlar: netlify/ayarlar.mjs
   ===================================================================== */

import { getStore } from '@netlify/blobs';
import AYAR from '../ayarlar.mjs';

const KAYNAK_URL = process.env.SUKOB_URL || AYAR.kaynakUrl;
const ONBELLEK_MS = Math.max(10, AYAR.onbellekSn || 10) * 1000;
const ENGEL_MS = (AYAR.engelBeklemeSn || 600) * 1000;
const BLOB_YAZ_MS = 60 * 1000; // son başarılı veri Blobs'a en fazla dakikada bir yazılır

let bellek = null;      // { zaman, liste }
let sonHata = null;     // { zaman, http_kodu, cloudflare, mesaj }
let sonBlobYazim = 0;
let sonTani = 0;

function depo() {
  try {
    return getStore('sukob-fiyat');
  } catch {
    return null; // Netlify dışında (yerel test) Blobs yok; yalnızca bellek kullanılır
  }
}

async function oku(store, anahtar) {
  if (!store) return null;
  try {
    return await store.get(anahtar, { type: 'json' });
  } catch {
    return null;
  }
}

async function yaz(store, anahtar, deger) {
  if (!store) return;
  try {
    await store.setJSON(anahtar, deger);
  } catch (e) {
    console.error('Blobs yazılamadı:', e.message);
  }
}

/* ---------- Kaynak ---------- */

// "24-09-2026 20:58:11" → "2026-09-24T20:58:11+03:00"
function tarihCevir(s) {
  const m = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(String(s || '').trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}+03:00` : null;
}

async function kaynaktanCek() {
  const sonuc = { liste: [], http_kodu: 0, cloudflare: false, hata: null };
  const ayrac = KAYNAK_URL.includes('?') ? '&' : '?';
  let r, govde;
  try {
    r = await fetch(KAYNAK_URL + ayrac + 'cache=' + Date.now(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (sukob-fiyat)',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        Referer: 'https://sukobfiyat.com/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      signal: AbortSignal.timeout((AYAR.zamanAsimiSn || 8) * 1000)
    });
    govde = await r.text();
  } catch (e) {
    sonuc.hata = 'Kaynağa ulaşılamadı: ' + (e.name === 'TimeoutError' ? 'zaman aşımı' : e.message);
    return sonuc;
  }
  sonuc.http_kodu = r.status;

  // 403 / 429 / 503 ya da JSON yerine HTML: Cloudflare engeli say, aşmaya çalışma
  if ([403, 429, 503].includes(r.status)) {
    sonuc.cloudflare = true;
    sonuc.hata = `Kaynak ${r.status} döndü (muhtemel Cloudflare engeli)`;
    return sonuc;
  }
  if (govde && !govde.trimStart().startsWith('[') && /<html|Just a moment/i.test(govde)) {
    sonuc.cloudflare = true;
    sonuc.hata = 'JSON yerine HTML/doğrulama sayfası geldi (muhtemel Cloudflare engeli)';
    return sonuc;
  }
  if (!r.ok) {
    sonuc.hata = `Kaynak HTTP ${r.status} döndü`;
    return sonuc;
  }

  let veri;
  try {
    veri = JSON.parse(govde);
  } catch {
    sonuc.hata = 'Kaynaktan gelen JSON bozuk';
    return sonuc;
  }
  if (!Array.isArray(veri)) {
    sonuc.hata = 'Kaynaktan gelen JSON beklenen biçimde değil';
    return sonuc;
  }

  for (const o of veri) {
    if (!o || !o.url || !isFinite(Number(o.buyPrice)) || !isFinite(Number(o.sellPrice)) || o.buyPrice === null || o.sellPrice === null) continue;
    sonuc.liste.push({
      kod: String(o.url),
      ad: String(o.type ?? o.url),
      alis: Number(o.buyPrice),
      satis: Number(o.sellPrice),
      guncelleme: tarihCevir(o.lastUpdate)
    });
  }
  if (!sonuc.liste.length) sonuc.hata = 'Kaynaktan gelen veride fiyat yok';
  return sonuc;
}

/* ---------- Cevap ---------- */

const yuvarla = (x) => Math.round(x * 10000) / 10000;

function cevap(liste, durum) {
  const marj = Number(AYAR.karMarjiYuzde) || 0;
  const kodla = new Map(liste.map((o) => [o.kod, o]));
  const cikti = [];
  for (const [kod, ad] of Object.entries(AYAR.urunler || {})) {
    const o = kodla.get(kod);
    if (!o) continue;
    cikti.push({
      ad: ad || o.ad,
      kod,
      alis: yuvarla(o.alis),
      satis: yuvarla(o.satis * (1 + marj / 100)),
      guncelleme: o.guncelleme
    });
  }

  const enYeni = Math.max(0, ...cikti.map((o) => (o.guncelleme ? Date.parse(o.guncelleme) : 0)));
  const sn = ONBELLEK_MS / 1000;
  const basliklar = {
    'Content-Type': 'application/json; charset=utf-8',
    // Tarayıcı her seferinde sorsun; CDN sn saniye saklasın (ŞUKOB'a yük binmesin)
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Netlify-CDN-Cache-Control': `public, durable, s-maxage=${sn}, stale-while-revalidate=${sn * 2}`,
    'X-Fiyat-Durumu': durum
  };
  if (enYeni) basliklar['X-Fiyat-Yasi'] = String(Math.max(0, Math.round((Date.now() - enYeni) / 1000)));
  return new Response(JSON.stringify(cikti), { status: 200, headers: basliklar });
}

function veriYok() {
  return new Response(JSON.stringify({ hata: 'Fiyatlar alınamadı' }), {
    status: 502,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Netlify-CDN-Cache-Control': 'public, s-maxage=5'
    }
  });
}

/* ---------- Kurulum testi: /api/tani ---------- */

async function tani(store) {
  const json = (veri, status = 200) =>
    new Response(JSON.stringify(veri, null, 2), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store' }
    });
  if (!AYAR.taniAcik) return json({ hata: 'Tanı sayfası kapalı (netlify/ayarlar.mjs → taniAcik)' }, 404);
  if (Date.now() - sonTani < 10000) return json({ hata: 'Tanı sayfası 10 saniyede bir açılabilir, biraz bekleyip yenileyin.' }, 429);
  sonTani = Date.now();

  const bas = Date.now();
  const s = await kaynaktanCek();
  const kodlar = s.liste.map((o) => o.kod);
  const rapor = {
    ortam: 'Netlify Functions',
    kaynak: KAYNAK_URL,
    sure_ms: Date.now() - bas,
    http_kodu: s.http_kodu,
    basarili: s.liste.length > 0,
    hata: s.hata,
    cloudflare_engeli: s.cloudflare,
    kaynaktaki_kodlar: kodlar,
    ayarlarda_olup_kaynakta_olmayan: Object.keys(AYAR.urunler || {}).filter((k) => !kodlar.includes(k)),
    ilk_kalemler: s.liste.slice(0, 3),
    blobs_kullanilabilir: !!store,
    son_kaydedilen_hata: sonHata || (await oku(store, 'son-hata'))
  };
  if (s.cloudflare) {
    rapor.ipucu = 'Kaynak, Netlify sunucusunu Cloudflare ile engelliyor. Bu engel aşılmaya çalışılmamalı. Türkiye\'deki bir PHP hostinge geçin ya da ŞUKOB\'dan izin isteyin.';
  }
  return json(rapor);
}

/* ---------- Giriş ---------- */

export default async (req) => {
  const store = depo();
  if (new URL(req.url).pathname.replace(/\/$/, '').endsWith('/tani')) return tani(store);

  const simdi = Date.now();
  let kayit = bellek || (await oku(store, 'kaynak'));
  if (kayit && !bellek) bellek = kayit;

  if (kayit && simdi - kayit.zaman < ONBELLEK_MS) return cevap(kayit.liste, 'taze');

  // Cloudflare engeli görüldüyse bir süre kaynağı hiç denemeyiz (tekrar deneme döngüsü yok)
  const hata = sonHata || (await oku(store, 'son-hata'));
  if (hata && hata.cloudflare && simdi - hata.zaman < ENGEL_MS) {
    return kayit ? cevap(kayit.liste, 'bayat') : veriYok();
  }

  const s = await kaynaktanCek();
  if (s.liste.length) {
    kayit = { zaman: simdi, liste: s.liste };
    bellek = kayit;
    if (sonHata) {
      sonHata = null;
      await yaz(store, 'son-hata', null);
    }
    if (simdi - sonBlobYazim > BLOB_YAZ_MS) {
      sonBlobYazim = simdi;
      await yaz(store, 'kaynak', kayit);
    }
    return cevap(s.liste, 'taze');
  }

  // Kaynak hata verdi ya da JSON bozuk: sebebi kaydet, son başarılı veriyi dön
  sonHata = { zaman: simdi, http_kodu: s.http_kodu, cloudflare: s.cloudflare, mesaj: s.hata };
  console.error('ŞUKOB:', s.hata);
  await yaz(store, 'son-hata', sonHata);
  return kayit ? cevap(kayit.liste, 'bayat') : veriYok();
};

export const config = {
  path: ['/api/fiyatlar.php', '/api/fiyatlar', '/api/tani']
};
