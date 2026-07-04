# Makro Botu — Kaydet ve Oynat

Fare tıklamalarını ve klavye tuşlarını **zamanlamasıyla birlikte** kaydeder,
sonra istediğin kadar tekrar aynen oynatır.

## Kurulum (Windows)

1. Bilgisayarında Python yoksa kur: https://www.python.org/downloads/
   - Kurulum ekranında **"Add Python to PATH"** kutusunu mutlaka işaretle!
2. Bu klasördeki **`kur.bat`** dosyasına çift tıkla (kütüphaneyi kurar, bir kez yeterli).

## Kullanım

1. **`baslat.bat`** dosyasına çift tıkla.
2. Menüden **1** seç (Yeni makro kaydet).
3. **F9**'a bas → kayıt başlar. Şimdi normal işini yap: tıkla, yaz, kaydır...
4. Bitince tekrar **F9**'a bas → kayıt biter, makroya bir isim ver.
5. Menüden **2** seç (Makro oynat), makroyu seç:
   - **Kaç kez tekrar?** → sayı gir, ya da `0` yaz = sen durdurana kadar sonsuz döngü.
   - **Hız?** → `1` normal, `2` iki kat hızlı, `0.5` yarı hızda.
6. Oynatma sırasında durdurmak için **ESC**'ye bas.

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
