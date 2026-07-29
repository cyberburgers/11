# Automa - takipçi listesinde "Takip et" döngüsü

`takip-et-dongu.js` dosyası, Automa akışının **takipçi modalı açıldıktan sonraki** eksik
kısmını doldurur: butonlara tek tek basma + modal içinde aşağı kaydırma.

## Kurulum

1. Automa editöründe akışının son bloğu olan `Delay 3000`'in çıkışına
   **JavaScript Code** (Kategori: *General*) bloğu bağla.
2. `takip-et-dongu.js` içeriğini bloğun kod alanına yapıştır.
3. Bloğun ayarlarında **Timeout** değerini `600000` yap (varsayılan 20000 ms döngüyü
   yarıda keser).
4. Üstteki `AYARLAR` bölümünden `HEDEF` (kaç kişi) ve bekleme sürelerini değiştir.

## Neden JavaScript bloğu, "Click element" değil?

Instagram'ın takipçi listesi `div[role="dialog"]` içinde **sanal liste** olarak çalışır:

- Automa'nın **Scroll element** bloğu sayfa gövdesini kaydırır, modalin içindeki
  kaydırılabilir div'i bulamaz. Kod bu div'i `scrollHeight > clientHeight` kontrolüyle
  kendisi bulur.
- **Click element** bloğu her tıklamadan sonra DOM yeniden çizildiği için eski
  referansa takılır. Kod her turda butonları yeniden sorgular.
- Zaten takip edilenlerin butonu "Takiptesin" yazar; kod sadece "Takip et" /
  "Follow" / "Geri takip et" metinli butonları seçer.

## Sadece Automa bloklarıyla yapmak istersen

`Repeat Task` (tekrar: 15) döngüsü içine sırayla:

| Blok | Ayar |
|---|---|
| Click element | Selector tipi **XPath**: `(//div[@role='dialog']//button[contains(., 'Takip et')])[1]` |
| Delay | 5000 |
| JavaScript Code | `kaydiriciBul().scrollTop += 800;` (kaydırma yine JS gerektirir) |

Bu yöntem yeni isim yüklenmesini bekleyemediği için tur kaçırır; tek JS bloğu daha
güvenilir.

## Riskler

Toplu takip Instagram kullanım şartlarına aykırıdır. Günde ~100-150 üzeri takip
işlemi hesap kısıtlaması/askıya alınmasıyla sonuçlanabilir. Bekleme sürelerini
düşürmek tespit riskini artırır.
