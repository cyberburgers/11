/*
 * Automa "JavaScript Kodu" bloguna yapistirilacak metin.
 *
 * Akistaki yeri: ... -> Ogeye tikla (takipci listesini acan) -> [BU BLOK]
 * Baska bloga gerek yok. Kosullar / Oge Kaydir / Gorevi Yinele bloklarini sil.
 *
 * Blok ayari:
 *   Zaman asimi (timeout) = 600000
 *
 * Ne yapar:
 *   - Ekranda "Takip et" butonu varsa tiklar
 *   - Yoksa listeyi asagi kaydirir, yeni isimlerin yuklenmesini bekler
 *   - HEDEF sayisina ulasinca durur
 */

// ================= AYARLAR =================
const HEDEF       = 15;   // kac kisi takip edilecek
const BEKLE_MIN   = 4000; // iki tiklama arasi en az (ms)
const BEKLE_MAX   = 9000; // iki tiklama arasi en fazla (ms)
const MAX_BOS_TUR = 15;   // ust uste kac bos kaydirmadan sonra dursun
// ===========================================

const uyu     = (ms) => new Promise((r) => setTimeout(r, ms));
const rasgele = (a, b) => Math.floor(Math.random() * (b - a)) + a;

function dialogBul() {
  const hepsi = document.querySelectorAll('div[role="dialog"]');
  return hepsi[hepsi.length - 1] || null;
}

function kaydiriciBul() {
  const d = dialogBul();
  if (!d) return null;
  let enIyi = null;
  for (const el of d.querySelectorAll('div')) {
    if (el.scrollHeight > el.clientHeight + 50) {
      if (!enIyi || el.scrollHeight > enIyi.scrollHeight) enIyi = el;
    }
  }
  return enIyi;
}

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
      const k = kaydiriciBul();
      if (!k) {
        console.warn('Takipci penceresi bulunamadi.');
        break;
      }
      const onceki = k.scrollTop;
      k.scrollTop = k.scrollHeight;
      await uyu(2500);
      if (k.scrollTop === onceki) bosTur++;
      else bosTur = 0;
      continue;
    }

    bosTur = 0;
    const btn = butonlar[0];
    btn.scrollIntoView({ block: 'center' });
    await uyu(600);
    btn.click();
    sayac++;
    console.log('Takip edildi: ' + sayac + '/' + HEDEF);

    await uyu(rasgele(BEKLE_MIN, BEKLE_MAX));
  }

  console.log('Bitti. Toplam takip: ' + sayac);
  automaNextBlock({ takipEdilen: sayac });
})();
