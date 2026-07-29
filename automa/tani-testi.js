/*
 * TANI TESTI - Automa'ya gerek yok.
 *
 * Kullanimi:
 *   1. Instagram'da takipci penceresini elle ac
 *   2. F12 -> Console sekmesi
 *   3. Chrome yapistirmayi engellerse once "allow pasting" yazip Enter'a bas
 *   4. Asagidaki metnin tamamini yapistir, Enter
 *
 * Ciktisi, kaydirmanin neden calismadigini tam olarak soyler.
 */

(() => {
  const dlgs = [...document.querySelectorAll('div[role="dialog"]')];
  console.log('1) Sayfadaki pencere sayisi:', dlgs.length);
  if (!dlgs.length) {
    console.warn('Takipci penceresi acik degil.');
    return;
  }

  const d = dlgs
    .map((x) => [x, x.querySelectorAll('a[href^="/"]').length])
    .sort((a, b) => b[1] - a[1])[0][0];

  const linkSayisi = d.querySelectorAll('a[href^="/"]').length;
  console.log('2) Secilen penceredeki profil linki:', linkSayisi);

  const butonlar = [...d.querySelectorAll('button')];
  console.log('3) Butonlardaki yazilar:', butonlar.map((b) => (b.innerText || '').trim()));

  const sc = [...d.querySelectorAll('div')].filter((e) => e.scrollHeight > e.clientHeight + 50);
  console.log('4) Kaydirilabilir kutu sayisi:', sc.length);
  sc.forEach((e, i) => console.log('   kutu ' + i, '| ic yukseklik:', e.scrollHeight, '| gorunen:', e.clientHeight));

  if (!sc.length) {
    console.warn('Kaydirilabilir kutu bulunamadi - sorun burada.');
    return;
  }

  const k = sc[0];
  console.log('5) Kaydirmadan once konum:', k.scrollTop);
  k.scrollTop = k.scrollHeight;

  setTimeout(() => {
    console.log('6) Kaydirmadan sonra konum:', k.scrollTop);
    console.log('7) Yeni link sayisi:', d.querySelectorAll('a[href^="/"]').length, '(onceki: ' + linkSayisi + ')');
  }, 2000);
})();
