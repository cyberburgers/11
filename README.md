# Buton Botu PRO

Sen tarifi kurarsın, bot uygular. Butonları koordinatla değil,
**ekrandaki görüntüsünden tanır** — buton yer değiştirse bile bulur ve tıklar.

Örnek tarif:
> 📷 "Kaydet" butonunu bul ve tıkla → ⏱ 2 sn bekle → ⌨ "merhaba" yaz → ↵ Enter

## Kurulum (Windows, bir kez)

1. Python yoksa kur: https://www.python.org/downloads/
   - Kurarken **"Add Python to PATH"** kutusunu mutlaka işaretle!
2. **`kur.bat`** dosyasına çift tıkla (kütüphaneleri kurar).

## Hızlı başlangıç

1. **`baslat.bat`**'a çift tıkla.
2. **📷 Butona Tıkla** → hedef pencereyi öne getir (3 sn) → ekran donar →
   fareyle **butonun etrafına kutu çiz** → ayarları seç → tarife eklenir.
3. Tekrar sayısını gir (`0` = sonsuz) → **▶ BAŞLAT**.

## Adım türleri (➕ Diğer Adımlar menüsü)

| Adım | Ne yapar |
|------|----------|
| 📷 Butona tıkla | Butonu ekranda görüntüsünden bulur, tıklar (sol/çift/sağ) |
| 🎯 Konuma tıkla | Sabit (x, y) noktasına tıklar — fareyi götür, konumu kendisi alır |
| 👁 Buton bekle | Bir görüntü **görünene** ya da **kaybolana** kadar bekler (örn. "yükleniyor" yazısı kaybolsun) |
| ⏱ Bekle | Sabit süre bekler |
| 🎲 Rastgele bekle | İki değer arasında rastgele süre bekler |
| ⌨ Yazı yaz | Metin yazar (Türkçe karakter destekli) |
| ↵ Tuşa bas | Enter, Tab, F5... (istenirse N kez) |
| ⌃ Kısayol | ctrl+c, alt+tab, ctrl+shift+s gibi kombinasyonlar |
| 🖱 Tekerlek kaydır | Sayfayı aşağı/yukarı kaydırır |
| 🔔 Bip sesi | Ses çalar (örn. iş bitince haber versin) |

## Buton adımının ayarları

- **Tıklama şekli:** sol / çift / sağ tık
- **En fazla bekleme:** buton henüz ekranda değilse kaç sn beklensin
- **Bulunamazsa:** hata verip dursun mu, atlayıp devam mı etsin
- **Hassasiyet:** bulamıyorsa düşür, yanlış yere tıklıyorsa yükselt
- **Tıklama kaydırması:** butonun ortası yerine örn. 20px sağına tıkla

## Tarif düzenleme

- **Çift tık** veya **✎** → adımı düzenle
- **↑ ↓** → sırala, **⧉** → kopyala, **✕** → sil, **🗑 Tümü** → temizle
- **▶ Test** → sadece seçili adımı bir kez dener
- **💾 / 📂** → tarifi dosyaya kaydet / geri yükle
- Kapatırken tarif otomatik saklanır, açınca kaldığın yerden devam edersin

## ⚙ Ayarlar

- Genel tanıma hassasiyeti
- Fare hareket hızı (0 = ışınlan)
- Adımlar arası / turlar arası bekleme
- Başlarken geri sayım süresi
- **İnsansı mod:** tıklamalara küçük rastgele sapma ve gecikmeler ekler
- **Kısayol tuşları:** Başlat (varsayılan **F8**) ve Durdur (varsayılan **ESC**)
  — pencere simge durumundayken bile çalışır

## Durdurma

- **ESC** (veya ayarladığın tuş), **⏹ Durdur** butonu,
- Acil durum: **fareyi ekranın sol üst köşesine fırlat** → bot anında durur.

## İpuçları

- Kutu çizerken **sadece butonu** al, etrafından boşluk alma.
- Buton ekranda **görünür olmalı**; bot kapalı/örtülü pencereyi göremez.
- Çözünürlük veya sayfa yakınlaştırması değişirse butonu yeniden tanıt.
- Dosyalar: buton resimleri `butonlar/`, tarifler `tarifler/`, ayarlar `ayarlar.json`.

## Eski sürüm (koordinatlı makro kaydedici)

`bot.py` içindeki eski "kaydet-oynat" makro aracı hâlâ duruyor;
`baslat-konsol.bat` ile açabilirsin.
