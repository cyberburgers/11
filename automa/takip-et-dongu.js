/*
 * Automa "JavaScript Code" bloguna yapistirilacak kod.
 * Akistaki yeri: ... -> Click element (Takipciler) -> Delay 3000 -> [BU BLOK]
 *
 * Blok ayarlari:
 *   - Timeout (ms): 600000   (varsayilan 20000 cok kisa, dongu yarida kesilir)
 *   - "Run in the main/active tab" isaretli kalsin
 *
 * Ne yapar: takipci modalinde "Takip et" butonlarini tek tek tiklar,
 * buton kalmayinca modalin ic kaydiricisini asagi iter, yeni isimler
 * yuklenene kadar bekler. HEDEF sayisina ulasinca sonraki bloga gecer.
 */

// ---------- AYARLAR ----------
const HEDEF      = 15;    // kac kisi takip edilecek
const BEKLE_MIN  = 4000;  // iki tiklama arasi en az ms
const BEKLE_MAX  = 9000;  // iki tiklama arasi en fazla ms
const MAX_BOS_TUR = 15;   // ust uste kac kez bos kaydirma sonrasi pes edilsin
// -----------------------------

const uyu     = (ms) => new Promise((r) => setTimeout(r, ms));
const rasgele = (a, b) => Math.floor(Math.random() * (b - a)) + a;

function dialogBul() {
  const hepsi = document.querySelectorAll('div[role="dialog"]');
  return hepsi[hepsi.length - 1] || null; // en ustteki modal
}

// Modalin gercek kaydirilabilir div'i (sanal liste konteyneri)
function kaydiriciBul() {
  const d = dialogBul();
  if (!d) return null;
  let enIyi = null;
  for (const el of d.querySelectorAll('div')) {
    if (el.scrollHeight > el.clientHeight + 80) {
      if (!enIyi || el.scrollHeight > enIyi.scrollHeight) enIyi = el;
    }
  }
  return enIyi;
}

// "Takip et" / "Follow" butonlari. "Takiptesin" ve "Takip isteği gönderildi" haric.
function takipButonlari() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('button, div[role="button"]')].filter((b) => {
    const t = (b.innerText || '').trim().toLocaleLowerCase('tr');
    return t === 'takip et' || t === 'follow' || t === 'geri takip et' || t === 'follow back';
  });
}

(async () => {
  let sayac = 0;
  let bosTur = 0;

  while (sayac < HEDEF && bosTur < MAX_BOS_TUR) {
    const butonlar = takipButonlari();

    if (butonlar.length === 0) {
      // Ekranda takip edilecek kimse yok -> asagi kaydir, yeni isimleri bekle
      const kaydirici = kaydiriciBul();
      if (!kaydirici) {
        console.warn('Modal kaydiricisi bulunamadi, modal kapanmis olabilir.');
        break;
      }
      const oncekiYukseklik = kaydirici.scrollHeight;
      kaydirici.scrollTop = kaydirici.scrollHeight;
      await uyu(2500);
      if (kaydirici.scrollHeight === oncekiYukseklik) bosTur++;
      else bosTur = 0;
      continue;
    }

    bosTur = 0;
    const btn = butonlar[0];
    btn.scrollIntoView({ block: 'center' });
    await uyu(600);
    btn.click();
    sayac++;
    console.log(`[${sayac}/${HEDEF}] takip edildi`);

    await uyu(rasgele(BEKLE_MIN, BEKLE_MAX));
  }

  console.log(`Bitti. Toplam takip: ${sayac}`);
  automaNextBlock({ takipEdilen: sayac });
})();
