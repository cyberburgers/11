# Buton Botu

Sen tarifi kurarsın, bot uygular. Butonları koordinatla değil,
**ekrandaki görüntüsünden tanır** — buton yer değiştirse bile bulur ve tıklar.

Örnek tarif:
> 📷 "Kaydet" butonunu bul ve tıkla → ⏱ 2 saniye bekle → ⌨ "merhaba" yaz → ↵ Enter'a bas

## Kurulum (Windows, bir kez)

1. Python yoksa kur: https://www.python.org/downloads/
   - Kurarken **"Add Python to PATH"** kutusunu mutlaka işaretle!
2. **`kur.bat`** dosyasına çift tıkla (kütüphaneleri kurar).

## Kullanım

1. **`baslat.bat`**'a çift tıkla → koyu temalı pencere açılır.
2. **📷 Buton**'a bas:
   - Botun tanıyacağı butonun olduğu pencereyi öne getir (3 saniyen var).
   - Ekran donar → fareyle **butonun etrafına kutu çiz**.
   - İsim ver, tıklama şeklini seç (sol / çift / sağ) → tarife eklenir.
3. İstersen araya başka adımlar ekle:
   - **⏱ Bekle** → araya bekleme süresi koyar
   - **⌨ Yazı** → tıklanan yere metin yazar
   - **↵ Tuş** → Enter, Tab gibi bir tuşa basar
4. Adımları **↑ ↓** ile sırala, **✕ Sil** ile çıkar.
5. **Tekrar sayısını** gir (`0` = sen durdurana kadar sonsuz) → **▶ BAŞLAT**.
6. Bot 3 saniye sonra tarifi uygulamaya başlar.

### Durdurma

- Klavyeden **ESC**'ye bas, **veya**
- **⏹ Durdur** butonu, **veya**
- Acil durum: **fareyi ekranın sol üst köşesine fırlat** → bot anında durur.

### Tarifleri saklama

- **💾 Kaydet** ile tarifi dosyaya kaydet, **📂 Aç** ile sonra geri yükle.
- Buton resimleri `butonlar/`, tarifler `tarifler/` klasöründe durur.

## İpuçları

- Kutuyu çizerken **sadece butonu** al, etrafından fazla boşluk alma —
  ne kadar net olursa bot o kadar iyi tanır.
- Buton ekranda **görünür olmalı**; bot kapalı/örtülü pencereyi göremez.
- Ekran çözünürlüğü veya tarayıcı yakınlaştırması (zoom) değişirse butonun
  görüntüsü de değişir — o zaman butonu yeniden tanıtman gerekebilir.
- Buton hemen çıkmıyorsa (örn. sayfa yükleniyor) sorun değil: bot,
  ayarladığın süre kadar butonun ekranda belirmesini bekler.

## Eski sürüm (koordinatlı makro kaydedici)

`bot.py` içindeki eski "kaydet-oynat" makro aracı hâlâ duruyor;
`baslat-konsol.bat` ile açabilirsin. Ama buton tanıma sürümü daha
güvenilirdir — pencere yeri değişince şaşırmaz.
