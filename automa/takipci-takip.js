/* ==========================================================================
 * Takipçi penceresi otomasyonu — Automa "JavaScript kodu" bloğu
 *
 * Açık bir takipçi / takip edilen listesi penceresinde (role="dialog")
 * takip butonlarına sırayla basar, liste bitene ya da hedefe ulaşana kadar
 * kaydırır.
 *
 * Sonuç (automaNextBlock ile döner):
 *   { takipEdilen, denenen, sebep, saniye }
 *
 * Elle durdurmak için konsola:  window.__takipDur = true
 * ========================================================================== */

const AYAR = {
  hedef: 15,            // kaç takip yapılacak
  beklemeMin: 4000,     // takipler arası en az bekleme (ms)
  beklemeMaks: 9000,    // takipler arası en fazla bekleme (ms)
  maksBosTur: 10,       // art arda kaç başarısız kaydırmadan sonra bitsin
  maksDogrulanmayan: 3, // art arda kaç tıklama boşa giderse dursun
  maksSureDk: 15,       // toplam çalışma süresi sınırı
  listeBeklemeSn: 20,   // listenin yüklenmesi için bekleme
  dogrulamaMs: 3000,    // tıklamadan sonra butonun değişmesi için bekleme
};

const uyu = (ms) => new Promise((r) => setTimeout(r, ms));
const rasgele = (a, b) => Math.floor(Math.random() * (b - a)) + a;

const BASLANGIC = Date.now();
const gecenSn = () => Math.round((Date.now() - BASLANGIC) / 1000) + 'sn';
const zamanAsimi = () => Date.now() - BASLANGIC > AYAR.maksSureDk * 60000;
const log = (m) => console.log('[' + gecenSn() + '] ' + m);

/* --- metin karşılaştırma ------------------------------------------------ */
/* Küçük harfe çevirir, Türkçe aksanları temizler, fazla boşlukları atar:
 * "Geri  Takip Et" -> "geri takip et", "İstek Gönderildi" -> "istek gonderildi" */
const duzelt = (s) =>
  (s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const TAKIP_METINLERI = ['takip et', 'geri takip et', 'follow', 'follow back'];
const TAKIPTE_METINLERI = [
  'takip ediliyor', 'takipte', 'istek gonderildi',
  'following', 'requested', 'unfollow', 'takibi birak',
];

/* Butonun metnini innerText, textContent ve aria-label üzerinden dener —
 * biri gizli span yüzünden boş gelse bile diğeri yakalar. */
function butonAdaylari(b) {
  return [b.innerText, b.textContent, b.getAttribute('aria-label')]
    .map(duzelt)
    .filter(Boolean);
}

function takipButonuMu(b) {
  const adaylar = butonAdaylari(b);
  if (!adaylar.length) return false;
  // Zaten takip ediliyorsa hedef değil.
  if (adaylar.some((t) => TAKIPTE_METINLERI.some((m) => t.includes(m)))) return false;
  // aria-label "Takip et kullanici_adi" gibi olabildiği için önek de kabul edilir.
  return adaylar.some((t) =>
    TAKIP_METINLERI.some((m) => t === m || t.startsWith(m + ' '))
  );
}

/* --- pencere / liste ---------------------------------------------------- */
function dialogBul() {
  const hepsi = [...document.querySelectorAll('div[role="dialog"]')];
  if (!hepsi.length) return null;
  return hepsi
    .map((d) => [d, d.querySelectorAll('a[href]').length])
    .sort((a, b) => b[1] - a[1])[0][0];
}

/* Kaydırılabilir kap bir kez bulunur ve saklanır; her turda tüm div'leri
 * taramak hem yavaş hem de sıralama değişince yanlış kabı seçebiliyor. */
let _kaydirici = null;
function kaydiriciBul() {
  if (
    _kaydirici &&
    _kaydirici.isConnected &&
    _kaydirici.scrollHeight > _kaydirici.clientHeight + 50
  ) {
    return _kaydirici;
  }
  const d = dialogBul();
  if (!d) return null;
  _kaydirici =
    [...d.querySelectorAll('div')]
      .filter((e) => e.scrollHeight > e.clientHeight + 50)
      .sort((a, b) => b.scrollHeight - a.scrollHeight)[0] || null;
  return _kaydirici;
}

function satirlar() {
  const d = dialogBul();
  return d ? [...d.querySelectorAll('a[href]')] : [];
}

/* İşlenen butonlar işaretlenir: DOM geç güncellenirse aynı satıra ikinci kez
 * basılmasın. WeakSet olduğu için eleman silinince kaydı da düşer. */
const islenen = new WeakSet();

function takipButonlari() {
  const d = dialogBul();
  if (!d) return [];
  return [...d.querySelectorAll('button, div[role="button"]')].filter(
    (b) => !islenen.has(b) && b.getClientRects().length > 0 && takipButonuMu(b)
  );
}

async function listeyiBekle(saniye) {
  for (let i = 0; i < saniye * 2; i++) {
    if (satirlar().length > 0) return true;
    await uyu(500);
  }
  return false;
}

/* Tıklar ve gerçekten takip edildiğini doğrular: buton artık "Takip Et"
 * olmamalı (ya "Takip Ediliyor"a döner ya da satır listeden düşer). */
async function tiklaVeDogrula(btn) {
  btn.scrollIntoView({ block: 'center' });
  await uyu(600);
  btn.click();
  const bitis = Date.now() + AYAR.dogrulamaMs;
  while (Date.now() < bitis) {
    await uyu(250);
    if (!btn.isConnected) return true;
    if (!takipButonuMu(btn)) return true;
  }
  return false;
}

/* Liste sonuna kaydırır; yeni satır geldiyse true döner. */
async function kaydir(bosTur) {
  const liste = satirlar();
  if (!liste.length) return false;
  const oncekiSayi = liste.length;

  const k = kaydiriciBul();
  if (k) {
    // Takılan lazy-load'u tetiklemek için önce biraz yukarı, sonra dibe.
    if (bosTur > 0) {
      k.scrollTop = Math.max(0, k.scrollTop - 400);
      await uyu(400);
    }
    k.scrollTop = k.scrollHeight;
  } else {
    liste[liste.length - 1].scrollIntoView({ block: 'end' });
  }
  log('Kaydırılıyor... (' + oncekiSayi + ' satır, boş tur: ' + bosTur + ')');

  for (let i = 0; i < 12; i++) {
    await uyu(500);
    if (satirlar().length > oncekiSayi) return true;
  }
  return false;
}

/* --- akış --------------------------------------------------------------- */
/* automaNextBlock tam olarak bir kez çağrılır; aksi halde bir hata durumunda
 * Automa akışı sonsuza kadar bu blokta asılı kalıyor. */
let bitirildi = false;
function bitir(sonuc) {
  if (bitirildi) return;
  bitirildi = true;
  const cikti = { saniye: Math.round((Date.now() - BASLANGIC) / 1000), ...sonuc };
  log('Bitti. ' + JSON.stringify(cikti));
  if (typeof automaNextBlock === 'function') automaNextBlock(cikti);
}

(async () => {
  window.__takipDur = false;
  let takipEdilen = 0;
  let denenen = 0;

  try {
    if (!dialogBul()) {
      bitir({ takipEdilen: 0, denenen: 0, sebep: 'takipçi penceresi açık değil' });
      return;
    }
    if (!(await listeyiBekle(AYAR.listeBeklemeSn))) {
      bitir({ takipEdilen: 0, denenen: 0, sebep: 'liste yüklenmedi' });
      return;
    }
    log('Liste yüklendi. Başlangıç satır sayısı: ' + satirlar().length);

    let bosTur = 0;
    let dogrulanmayan = 0;
    let sebep = 'hedefe ulaşıldı';

    while (takipEdilen < AYAR.hedef) {
      if (window.__takipDur) { sebep = 'elle durduruldu'; break; }
      if (zamanAsimi()) { sebep = 'süre sınırı doldu'; break; }
      if (bosTur >= AYAR.maksBosTur) { sebep = 'liste sonuna gelindi'; break; }
      if (dogrulanmayan >= AYAR.maksDogrulanmayan) {
        sebep = 'tıklamalar işlenmiyor (işlem engeli olabilir)';
        break;
      }
      if (!dialogBul()) { sebep = 'pencere kapandı'; break; }

      const butonlar = takipButonlari();
      if (!butonlar.length) {
        if (!satirlar().length) {
          log('Liste şu an boş, bekleniyor...');
          bosTur++;
          await uyu(2000);
          continue;
        }
        bosTur = (await kaydir(bosTur)) ? 0 : bosTur + 1;
        continue;
      }

      bosTur = 0;
      const btn = butonlar[0];
      islenen.add(btn);
      denenen++;

      if (await tiklaVeDogrula(btn)) {
        takipEdilen++;
        dogrulanmayan = 0;
        log('Takip edildi: ' + takipEdilen + '/' + AYAR.hedef);
        await uyu(rasgele(AYAR.beklemeMin, AYAR.beklemeMaks));
      } else {
        dogrulanmayan++;
        log('Tıklama sonuç vermedi (' + dogrulanmayan + '/' + AYAR.maksDogrulanmayan + ')');
        await uyu(2000);
      }
    }

    bitir({ takipEdilen, denenen, sebep });
  } catch (e) {
    console.error('Takip betiği hatası:', e);
    bitir({
      takipEdilen,
      denenen,
      sebep: 'beklenmeyen hata',
      hata: String((e && e.message) || e),
    });
  }
})();
