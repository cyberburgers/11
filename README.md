# Makro Botu — Kaydet ve Oynat

Fare tıklamalarını ve klavye tuşlarını **zamanlamasıyla birlikte** kaydeder,
sonra istediğin kadar tekrar aynen oynatır.

## Kurulum (Windows)

1. Bilgisayarında Python yoksa kur: https://www.python.org/downloads/
   - Kurulum ekranında **"Add Python to PATH"** kutusunu mutlaka işaretle!
2. Bu klasördeki **`kur.bat`** dosyasına çift tıkla (kütüphaneyi kurar, bir kez yeterli).

## Kullanım (Arayüz / pencere)

1. **`baslat.bat`** dosyasına çift tıkla → küçük bir pencere açılır.
2. **⏺ Yeni Kayıt Başlat** butonuna bas. Pencere küçülür, normal işini yap:
   tıkla, yaz, kaydır... Bitince klavyeden **F9**'a bas.
3. Açılan kutuya makroya bir isim ver → listede belirir.
4. Listeden makroyu seç, **Tekrar** ve **Hız** ayarla:
   - **Tekrar:** `1` bir kez, herhangi bir sayı, ya da `0` = sen durdurana kadar sonsuz.
   - **Hız:** `1` normal, `2` iki kat hızlı, `0.5` yarı hızda.
5. **▶ Oynat** butonuna bas (3 saniye sonra başlar).
6. Durdurmak için **⏹ Durdur** butonu ya da klavyeden **ESC**.

> Not: Arayüz için ekstra bir şey kurmana gerek yok — `tkinter`, Windows'ta
> python.org'dan kurulan standart Python ile birlikte gelir.

### Konsol (pencere olmadan) kullanmak istersen

**`baslat-konsol.bat`** dosyasına çift tıkla → metin menülü sürüm açılır
(aynı kayıt/oynatma özellikleri).

## Kısayollar

| Tuş | İşlev |
|-----|-------|
| F9  | Kaydı başlat / durdur |
| ESC | Oynatmayı durdur |

## Notlar

- Makrolar `makrolar/` klasörüne `.json` dosyası olarak kaydedilir; istersen
  metin düzenleyiciyle açıp elle düzenleyebilirsin (koordinatlar, bekleme süreleri).
- Oynatma başlamadan 3 saniye sayar — bu sürede hedef pencereyi öne getir.
- Kayıt yaptığın ekran çözünürlüğü/pencere konumu oynatırken aynı olmalı,
  yoksa tıklamalar yanlış yere gider.
- Bazı oyunlar/programlar (anti-cheat korumalı olanlar) sanal tıklamaları
  engelleyebilir; bu normaldir.
- Yönetici olarak çalışan pencerelere tıklaması gerekiyorsa `baslat.bat`'ı
  sağ tık → "Yönetici olarak çalıştır" ile aç.
