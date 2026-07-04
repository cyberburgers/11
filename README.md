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
| 📷 Butona tıkla | Butonu görüntüsünden bulur, tıklar — istersen **tüm eşleşmelere** |
| 🎯 Konuma tıkla | Sabit (x, y) noktasına tıklar — fareyi götür, konumu kendisi alır |
| 👁 Buton bekle | Bir görüntü **görünene** ya da **kaybolana** kadar bekler |
| 🎨 Renk bekle | Bir noktanın rengi **gelene/gidene** kadar bekler (örn. gösterge yeşile dönsün) |
| ⏱ / 🎲 Bekle | Sabit ya da rastgele süre bekler |
| ⌨ Yazı yaz | Metin yazar (Türkçe karakter destekli) |
| 📋 Panoya kopyala | Metni panoya alır, istersen Ctrl+V ile yapıştırır |
| ↵ / ⌃ Tuş & kısayol | Enter, Tab... veya ctrl+c, alt+tab kombinasyonları |
| 🖱 Tekerlek kaydır | Sayfayı aşağı/yukarı kaydırır |
| 🔀 Koşullu atlama | Görüntü **görünüyorsa/görünmüyorsa** başka adıma atlar (örn. hata penceresi çıkarsa kapat) |
| 🔁 Döngü | Belirtilen adıma geri döner, N kez — tarif içinde tekrar bloğu |
| 🪟 Pencere öne getir | Başlığında verilen metin geçen pencereyi öne getirir |
| 🚀 Program/site aç | .exe, program adı veya web adresi açar |
| 📸 Ekran görüntüsü | Ekranı `ekranlar/` klasörüne kaydeder |
| 🔔 Bip sesi | Ses çalar (örn. bir noktada haber versin) |

## ⏰ Zamanlama

**⏰ Zamanla** butonuyla tarifi otomatik başlatabilirsin:
- **Belirli saatte** (her gün, örn. 09:30) — program açık kaldığı sürece
- **Her N dakikada bir** (ilk çalıştırma hemen yapılır)

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

- Genel tanıma hassasiyeti, fare hızı (0 = ışınlan)
- Adımlar arası / turlar arası bekleme, geri sayım süresi
- **Akıllı arama:** buton bulunamazsa farklı boyutlarda da aranır —
  zoom/çözünürlük değişse bile bulur
- **Hızlı arama:** gri tonlamalı arama, büyük ekranlarda hızlandırır
- **İnsansı mod:** tıklamalara küçük rastgele sapma ve gecikmeler ekler
- **Hata anında ekran görüntüsü:** bot bir şey bulamayıp durursa o anki ekran
  `hatalar/` klasörüne kaydedilir — ne olduğunu görürsün
- **Bitiş sesi:** iş tamamlanınca bip çalar
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
