/*
 * Automa "JavaScript Kodu" bloguna yapistirilacak metin.
 *
 * Akistaki yeri: ... -> Ogeye tikla (takipci listesini acan) -> [BU BLOK]
 * Baska bloga gerek yok.
 *
 * Blok ayari:
 *   Zaman asimi (timeout) = 600000
 *   Yurutme baglami       = Aktif sekme
 *   Run before page loaded = kapali
 */

// ================= AYARLAR =================
const HEDEF       = 15;   // bu oturumda kac kisi takip edilecek
const BEKLE_MIN   = 6000; // iki tiklama arasi en az (ms)
const BEKLE_MAX   = 20000;// iki tiklama arasi en fazla (ms)
const MAX_BOS_TUR = 40;   // ust uste kac bos turdan sonra dursun
const ADIM_PIKSEL = 300;  // her adimda kac piksel insin
const ADIM_SAYISI = 6;    // bir turda kac adim atilsin

// --- insani davranis ---
const ATLAMA_ORANI  = 0.25;         // bu oranla birini hic takip etmeden atla
const MOLA_ARALIGI  = [3, 6];       // kac takipte bir mola verilsin
const MOLA_SURESI   = [45000, 120000]; // mola uzunlugu (ms)
const UZUN_DURAKSAMA = 0.15;        // bu oranla arada ekstra uzun duraklama
// ===========================================

const uyu     = (ms) => new Promise((r) => setTimeout(r, ms));
const rasgele = (a, b) => Math.floor(Math.random() * (b - a)) + a;

const BASLANGIC = Date.now();
const gecenSn   = () => Math.round((Date.now() - BASLANGIC) / 1000) + 'sn';

// Duz rastgele araliktansa ortasi yogun bir dagilim insan temposuna
// daha yakin: cogu bekleme ortalamaya toplanir, arada uzun olan cikar.
function insaniSure(min, max) {
  const ort = (Math.random() + Math.random() + Math.random()) / 3;
  let ms = min + ort * (max - min);
  if (Math.random() < UZUN_DURAKSAMA) ms += rasgele(8000, 25000);
  return Math.round(ms);
}

const atlananlar = new WeakSet();

function dialogBul() {
  const hepsi = [...document.querySelectorAll('div[role="dialog"]')];
  if (!hepsi.length) return null;
  return hepsi
    .map((d) => [d, d.querySelectorAll('a[href]').length])
    .sort((a, b) => b[1] - a[1])[0][0];
}

function satirlar() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('a[href]')];
}

// Modalde ic ice birden fazla kaydirilabilir katman olabiliyor ve liste
// buyudukce gercek kaydiricinin hangisi oldugu degisiyor. Tek bir aday
// secmek yerine hepsini toplayip hepsini birden kaydiriyoruz.
function kaydiricilar() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('div')].filter((e) => {
    if (e.scrollHeight <= e.clientHeight + 30) return false;
    const oy = getComputedStyle(e).overflowY;
    return oy === 'auto' || oy === 'scroll';
  });
}

function dipteMi(k) {
  return k.scrollTop + k.clientHeight >= k.scrollHeight - 5;
}

// scrollTop atamasi bazi sanal listelerde yuklemeyi tetiklemiyor;
// gercek tekerlek olayi gondermek daha guvenilir calisiyor.
async function kaydir() {
  const adaylar = kaydiricilar();
  const liste = satirlar();
  const sonSatir = liste[liste.length - 1] || null;
  const basSayi = liste.length;

  for (let i = 0; i < ADIM_SAYISI; i++) {
    for (const k of adaylar) {
      k.scrollTop = Math.min(k.scrollTop + ADIM_PIKSEL, k.scrollHeight);
      k.dispatchEvent(new WheelEvent('wheel', {
        deltaY: ADIM_PIKSEL, bubbles: true, cancelable: true,
      }));
      k.dispatchEvent(new Event('scroll', { bubbles: true }));
    }
    if (sonSatir) sonSatir.scrollIntoView({ block: 'end' });
    await uyu(300);
    if (satirlar().length > basSayi) break;
  }
  return adaylar;
}

function durumYaz(adaylar) {
  if (!adaylar.length) return 'kaydirici YOK';
  return adaylar
    .map((k) => k.scrollTop + '/' + (k.scrollHeight - k.clientHeight) + (dipteMi(k) ? ' DIP' : ''))
    .join('  ');
}

async function listeyiBekle(saniye) {
  for (let i = 0; i < saniye * 2; i++) {
    if (satirlar().length > 0) return true;
    await uyu(500);
  }
  return false;
}

(async () => {
  if (!dialogBul()) {
    console.warn('Takipci penceresi acik degil!');
    automaNextBlock({ hata: 'pencere yok' });
    return;
  }

  if (!(await listeyiBekle(20))) {
    console.warn('20 saniyede liste yuklenmedi.');
    automaNextBlock({ hata: 'liste yuklenmedi' });
    return;
  }
  console.log('Liste yuklendi. Baslangic link sayisi: ' + satirlar().length +
              ' | kaydirilabilir katman: ' + kaydiricilar().length);

  let sayac = 0;
  let bosTur = 0;
  let sonrakiMola = rasgele(MOLA_ARALIGI[0], MOLA_ARALIGI[1] + 1);

  while (sayac < HEDEF && bosTur < MAX_BOS_TUR) {
    const butonlar = takipButonlari();

    if (butonlar.length === 0) {
      const oncekiSayi = satirlar().length;
      if (oncekiSayi === 0) {
        console.log('Liste su an bos, bekleniyor...');
        bosTur++;
        await uyu(2000);
        continue;
      }

      const adaylar = await kaydir();
      console.log('[' + gecenSn() + '] Kaydirildi. link: ' + oncekiSayi +
                  ' | konum: ' + durumYaz(adaylar) + ' | bos tur: ' + bosTur);

      // Yukleme gec gelebilir: 8 saniyeye kadar artis bekle.
      let arttiMi = false;
      for (let i = 0; i < 16; i++) {
        await uyu(500);
        if (satirlar().length > oncekiSayi) { arttiMi = true; break; }
      }
      bosTur = arttiMi ? 0 : bosTur + 1;
      continue;
    }

    bosTur = 0;
    // Hep listenin en ustundekini secmek makinemsi duruyor; gorunenler
    // arasindan rastgele birini sec ve bazilarini hic takip etmeden gec.
    const btn = butonlar[rasgele(0, Math.min(butonlar.length, 3))];

    if (Math.random() < ATLAMA_ORANI) {
      atlananlar.add(btn);
      console.log('[' + gecenSn() + '] Bu kisi atlandi');
      await uyu(insaniSure(2000, 6000));
      continue;
    }

    btn.scrollIntoView({ block: 'center' });
    await uyu(insaniSure(800, 2500)); // once "bakiyormus" gibi dur
    btn.click();
    sayac++;
    console.log('[' + gecenSn() + '] Takip edildi: ' + sayac + '/' + HEDEF);

    if (sayac >= sonrakiMola && sayac < HEDEF) {
      const sure = rasgele(MOLA_SURESI[0], MOLA_SURESI[1]);
      console.log('[' + gecenSn() + '] Mola: ' + Math.round(sure / 1000) + ' saniye');
      await uyu(sure);
      sonrakiMola = sayac + rasgele(MOLA_ARALIGI[0], MOLA_ARALIGI[1] + 1);
    } else {
      await uyu(insaniSure(BEKLE_MIN, BEKLE_MAX));
    }
  }

  const hepsiDipte = kaydiricilar().every(dipteMi);
  const sebep = sayac >= HEDEF ? 'hedefe ulasildi'
              : hepsiDipte ? 'liste gercekten bitti (dipteyiz, Instagram yeni kisi vermiyor)'
              : 'kaydirma ilerlemedi ama dipte degiliz';
  console.log('[' + gecenSn() + '] Bitti. Toplam takip: ' + sayac + ' | Sebep: ' + sebep);
  automaNextBlock({ takipEdilen: sayac, sebep: sebep });
})();

function takipButonlari() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('button, div[role="button"]')].filter((b) => {
    if (atlananlar.has(b)) return false;
    const t = (b.innerText || '').trim().toLocaleLowerCase('tr');
    return t === 'takip et' || t === 'follow' || t === 'geri takip et' || t === 'follow back';
  });
}
