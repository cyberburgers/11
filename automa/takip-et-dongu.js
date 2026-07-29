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

// Modal icindeki kisi satirlari (profil linkleri). Kaydirilabilir
// konteyneri aramak yerine son satiri gorunume getiriyoruz —
// scrollIntoView konteyner bilgisi gerektirmez ve sanal listede
// Instagram'in yeni sayfa yuklemesini tetikler.
function satirlar() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('a[href^="/"]')];
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
  if (!dialogBul()) {
    console.warn('Takipci penceresi acik degil!');
    automaNextBlock({ hata: 'pencere yok' });
    return;
  }
  console.log('Pencere bulundu. Yuklu kisi sayisi: ' + satirlar().length);

  let sayac = 0;
  let bosTur = 0;

  while (sayac < HEDEF && bosTur < MAX_BOS_TUR) {
    const butonlar = takipButonlari();

    if (butonlar.length === 0) {
      const liste = satirlar();
      if (liste.length === 0) {
        console.warn('Listede kimse gorunmuyor.');
        break;
      }
      const oncekiSayi = liste.length;
      liste[liste.length - 1].scrollIntoView({ block: 'center' });
      console.log('Kaydiriliyor... (' + oncekiSayi + ' kisi yuklu)');
      await uyu(3000);
      if (satirlar().length === oncekiSayi) bosTur++;
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
