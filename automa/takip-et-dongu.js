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
const MAX_BOS_TUR = 30;   // ust uste kac bos kaydirmadan sonra dursun
// ===========================================

const uyu     = (ms) => new Promise((r) => setTimeout(r, ms));
const rasgele = (a, b) => Math.floor(Math.random() * (b - a)) + a;

// Sayfada birden fazla role="dialog" bulunabiliyor (gizli olanlar dahil).
// En cok profil linki icereni secmek, takipci penceresini garanti eder.
function dialogBul() {
  const hepsi = [...document.querySelectorAll('div[role="dialog"]')];
  if (!hepsi.length) return null;
  return hepsi
    .map((d) => [d, d.querySelectorAll('a[href^="/"]').length])
    .sort((a, b) => b[1] - a[1])[0][0];
}

// Modal icindeki kaydirilabilir kutu (en buyuk tasma hangisindeyse o).
function kaydiriciBul() {
  const d = dialogBul();
  if (!d) return null;
  const adaylar = [...d.querySelectorAll('div')]
    .filter((e) => e.scrollHeight > e.clientHeight + 50)
    .sort((a, b) => b.scrollHeight - a.scrollHeight);
  return adaylar[0] || null;
}

// Modal icindeki kisi satirlari (profil linkleri). Kaydirilabilir
// konteyneri aramak yerine son satiri gorunume getiriyoruz —
// scrollIntoView konteyner bilgisi gerektirmez ve sanal listede
// Instagram'in yeni sayfa yuklemesini tetikler.
function satirlar() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('a[href]')];
}

// Modal acilir acilmaz icerigi bos oluyor; isimler yarim-bir saniye
// sonra geliyor. Yuklenmeden devam edersek listeyi bos sanip cikiyoruz.
async function listeyiBekle(saniye) {
  for (let i = 0; i < saniye * 2; i++) {
    if (satirlar().length > 0) return true;
    await uyu(500);
  }
  return false;
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
  if (!(await listeyiBekle(20))) {
    console.warn('20 saniyede liste yuklenmedi.');
    automaNextBlock({ hata: 'liste yuklenmedi' });
    return;
  }
  console.log('Liste yuklendi. Baslangic link sayisi: ' + satirlar().length);

  let sayac = 0;
  let bosTur = 0;

  while (sayac < HEDEF && bosTur < MAX_BOS_TUR) {
    const butonlar = takipButonlari();

    if (butonlar.length === 0) {
      const liste = satirlar();
      if (liste.length === 0) {
        // Vazgecme — liste gecici olarak bosalmis olabilir, bekleyip tekrar bak.
        console.log('Liste su an bos, bekleniyor...');
        bosTur++;
        await uyu(2000);
        continue;
      }
      const oncekiSayi = liste.length;
      // Iki yontemi birden uygula: once konteyneri dibe it, sonra son
      // satiri gorunume getir. Biri tutmazsa digeri tutar.
      const k = kaydiriciBul();
      if (k) {
        // Dibe yapisik kalinca Instagram yeni sayfa istemiyor; once biraz
        // yukari cekip tekrar dibe itmek yuklemeyi yeniden tetikliyor.
        if (bosTur > 0) {
          k.scrollTop = Math.max(0, k.scrollTop - 400);
          await uyu(400);
        }
        k.scrollTop = k.scrollHeight;
      }
      liste[liste.length - 1].scrollIntoView({ block: 'end' });
      console.log('Kaydiriliyor... (' + oncekiSayi + ' link, bos tur: ' + bosTur + ')');

      // Yukleme bazen gec geliyor: 6 saniyeye kadar artis bekle.
      let arttiMi = false;
      for (let i = 0; i < 12; i++) {
        await uyu(500);
        if (satirlar().length > oncekiSayi) { arttiMi = true; break; }
      }
      bosTur = arttiMi ? 0 : bosTur + 1;
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

  const sebep = sayac >= HEDEF ? 'hedefe ulasildi'
              : bosTur >= MAX_BOS_TUR ? 'liste sonuna gelindi veya Instagram yukleme yapmiyor'
              : 'bilinmiyor';
  console.log('Bitti. Toplam takip: ' + sayac + ' | Sebep: ' + sebep);
  automaNextBlock({ takipEdilen: sayac, sebep: sebep });
})();
