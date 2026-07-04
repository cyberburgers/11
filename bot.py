# -*- coding: utf-8 -*-
"""
Makro Botu — fare ve klavye hareketlerini kaydeder, zamanlamasıyla aynen oynatır.

Kullanım:
    python bot.py

Kısayollar:
    F9  : Kaydı başlat / durdur
    ESC : Oynatmayı durdur
"""

import json
import os
import sys
import time
import threading

try:
    from pynput import mouse, keyboard
    from pynput.mouse import Button, Controller as MouseController
    from pynput.keyboard import Key, KeyCode, Controller as KeyboardController
except ImportError:
    print("HATA: 'pynput' kütüphanesi kurulu değil.")
    print("Kurmak için şu komutu çalıştır:  pip install pynput")
    sys.exit(1)

MAKRO_KLASORU = "makrolar"

# ---------------------------------------------------------------------------
# Yardımcılar: tuş/buton <-> metin dönüşümü (JSON'a kaydetmek için)
# ---------------------------------------------------------------------------

def tus_metne(key):
    """pynput tuş nesnesini JSON'a yazılabilir metne çevirir."""
    if isinstance(key, KeyCode):
        if key.char is not None:
            return {"tip": "karakter", "deger": key.char}
        return {"tip": "vk", "deger": key.vk}
    # Özel tuş (Key.enter, Key.space, ...)
    return {"tip": "ozel", "deger": key.name}


def metin_tusa(veri):
    """JSON'dan okunan metni pynput tuş nesnesine çevirir."""
    if veri["tip"] == "karakter":
        return veri["deger"]
    if veri["tip"] == "vk":
        return KeyCode.from_vk(veri["deger"])
    return getattr(Key, veri["deger"])


def buton_metne(button):
    return button.name  # 'left', 'right', 'middle'


def metin_butona(ad):
    return getattr(Button, ad)


# ---------------------------------------------------------------------------
# Kayıt
# ---------------------------------------------------------------------------

class Kaydedici:
    """F9'a basılana kadar tüm fare ve klavye olaylarını zaman damgasıyla toplar."""

    def __init__(self, fare_hareketi_kaydet=True):
        self.olaylar = []
        self.basladi = None
        self.kayit_bitti = threading.Event()
        self.fare_hareketi_kaydet = fare_hareketi_kaydet
        self._son_hareket_zamani = 0.0

    def _zaman(self):
        return time.time() - self.basladi

    def _ekle(self, olay):
        self.olaylar.append(olay)

    # --- fare olayları ---

    def _fare_hareket(self, x, y):
        if not self.fare_hareketi_kaydet:
            return
        simdi = time.time()
        # Hareketi saniyede ~50 örnekle sınırla ki dosya şişmesin
        if simdi - self._son_hareket_zamani < 0.02:
            return
        self._son_hareket_zamani = simdi
        self._ekle({"t": self._zaman(), "olay": "hareket", "x": x, "y": y})

    def _fare_tik(self, x, y, button, pressed):
        self._ekle({
            "t": self._zaman(), "olay": "tik", "x": x, "y": y,
            "buton": buton_metne(button), "basildi": pressed,
        })

    def _fare_teker(self, x, y, dx, dy):
        self._ekle({"t": self._zaman(), "olay": "teker", "x": x, "y": y, "dx": dx, "dy": dy})

    # --- klavye olayları ---

    def _tus_basildi(self, key):
        if key == Key.f9:  # kayıt bitirme tuşunu kaydetme
            self.kayit_bitti.set()
            return False
        self._ekle({"t": self._zaman(), "olay": "tus", "basildi": True, "tus": tus_metne(key)})

    def _tus_birakildi(self, key):
        if key == Key.f9:
            return
        self._ekle({"t": self._zaman(), "olay": "tus", "basildi": False, "tus": tus_metne(key)})

    def kaydet(self):
        """Kaydı başlatır; F9'a basılınca biter ve olay listesini döndürür."""
        print()
        print(">>> KAYIT BAŞLADI! Şimdi yapmak istediğin tıklamaları/tuşları yap.")
        print(">>> Bitirmek için F9 tuşuna bas.")
        print()

        self.basladi = time.time()

        fare_dinleyici = mouse.Listener(
            on_move=self._fare_hareket,
            on_click=self._fare_tik,
            on_scroll=self._fare_teker,
        )
        klavye_dinleyici = keyboard.Listener(
            on_press=self._tus_basildi,
            on_release=self._tus_birakildi,
        )

        fare_dinleyici.start()
        klavye_dinleyici.start()

        self.kayit_bitti.wait()  # F9'a basılana kadar bekle

        fare_dinleyici.stop()
        klavye_dinleyici.stop()

        sure = time.time() - self.basladi
        print(f">>> KAYIT BİTTİ. Süre: {sure:.1f} sn, olay sayısı: {len(self.olaylar)}")
        return self.olaylar


# ---------------------------------------------------------------------------
# Oynatma
# ---------------------------------------------------------------------------

class Oynatici:
    """Kaydedilmiş olayları aynı zamanlamayla tekrar oynatır. ESC ile durur."""

    def __init__(self, olaylar, hiz=1.0):
        self.olaylar = olaylar
        self.hiz = max(hiz, 0.1)
        self.durduruldu = threading.Event()
        self.fare = MouseController()
        self.klavye = KeyboardController()

    def _esc_dinle(self):
        def basildi(key):
            if key == Key.esc:
                self.durduruldu.set()
                return False
        dinleyici = keyboard.Listener(on_press=basildi)
        dinleyici.start()
        return dinleyici

    def _olayi_uygula(self, olay):
        tip = olay["olay"]
        if tip == "hareket":
            self.fare.position = (olay["x"], olay["y"])
        elif tip == "tik":
            self.fare.position = (olay["x"], olay["y"])
            buton = metin_butona(olay["buton"])
            if olay["basildi"]:
                self.fare.press(buton)
            else:
                self.fare.release(buton)
        elif tip == "teker":
            self.fare.position = (olay["x"], olay["y"])
            self.fare.scroll(olay["dx"], olay["dy"])
        elif tip == "tus":
            tus = metin_tusa(olay["tus"])
            if olay["basildi"]:
                self.klavye.press(tus)
            else:
                self.klavye.release(tus)

    def _bir_tur_oynat(self):
        onceki_t = 0.0
        for olay in self.olaylar:
            if self.durduruldu.is_set():
                return False
            bekleme = (olay["t"] - onceki_t) / self.hiz
            if bekleme > 0:
                # Uzun beklemeleri parçala ki ESC anında etki etsin
                if self.durduruldu.wait(timeout=bekleme):
                    return False
            onceki_t = olay["t"]
            self._olayi_uygula(olay)
        return True

    def oynat(self, tekrar=1):
        """tekrar=0 ise sonsuz döngü (ESC'ye kadar)."""
        if not self.olaylar:
            print("Oynatılacak olay yok (kayıt boş).")
            return

        dinleyici = self._esc_dinle()
        print()
        if tekrar == 0:
            print(">>> OYNATMA BAŞLADI (sonsuz döngü). Durdurmak için ESC.")
        else:
            print(f">>> OYNATMA BAŞLADI ({tekrar} tekrar). Durdurmak için ESC.")
        print(">>> 3 saniye içinde başlıyor, pencereyi hazırla...")
        if self.durduruldu.wait(timeout=3):
            print(">>> İptal edildi.")
            dinleyici.stop()
            return

        sayac = 0
        while not self.durduruldu.is_set():
            sayac += 1
            if tekrar == 0:
                print(f"    Tur {sayac} ...")
            else:
                print(f"    Tur {sayac} / {tekrar} ...")
            if not self._bir_tur_oynat():
                break
            if tekrar != 0 and sayac >= tekrar:
                break

        dinleyici.stop()
        if self.durduruldu.is_set():
            print(">>> OYNATMA DURDURULDU (ESC).")
        else:
            print(">>> OYNATMA TAMAMLANDI.")


# ---------------------------------------------------------------------------
# Makro dosyaları
# ---------------------------------------------------------------------------

def makro_kaydet(olaylar, isim):
    os.makedirs(MAKRO_KLASORU, exist_ok=True)
    yol = os.path.join(MAKRO_KLASORU, isim + ".json")
    with open(yol, "w", encoding="utf-8") as f:
        json.dump({"surum": 1, "olaylar": olaylar}, f, ensure_ascii=False)
    print(f"Makro kaydedildi: {yol}")
    return yol


def makro_yukle(isim):
    yol = os.path.join(MAKRO_KLASORU, isim + ".json")
    with open(yol, "r", encoding="utf-8") as f:
        veri = json.load(f)
    return veri["olaylar"]


def makrolari_listele():
    if not os.path.isdir(MAKRO_KLASORU):
        return []
    return sorted(
        dosya[:-5] for dosya in os.listdir(MAKRO_KLASORU) if dosya.endswith(".json")
    )


# ---------------------------------------------------------------------------
# Menü
# ---------------------------------------------------------------------------

def sayi_sor(mesaj, varsayilan, en_az=0):
    cevap = input(mesaj).strip()
    if not cevap:
        return varsayilan
    try:
        deger = int(cevap)
        return deger if deger >= en_az else varsayilan
    except ValueError:
        return varsayilan


def ondalik_sor(mesaj, varsayilan):
    cevap = input(mesaj).strip().replace(",", ".")
    if not cevap:
        return varsayilan
    try:
        return float(cevap)
    except ValueError:
        return varsayilan


def kayit_akisi():
    print()
    hareket = input("Fare hareketleri de kaydedilsin mi? (E/h, varsayılan E): ").strip().lower()
    fare_hareketi = hareket != "h"
    print("Hazır olduğunda F9'a bas, kayıt başlasın. Bitirmek için yine F9.")

    # Başlatmak için F9 bekle
    baslat = threading.Event()
    def bekle_f9(key):
        if key == Key.f9:
            baslat.set()
            return False
    dinleyici = keyboard.Listener(on_press=bekle_f9)
    dinleyici.start()
    baslat.wait()
    dinleyici.stop()
    time.sleep(0.3)  # F9'un kendisi kayda karışmasın

    kaydedici = Kaydedici(fare_hareketi_kaydet=fare_hareketi)
    olaylar = kaydedici.kaydet()

    if not olaylar:
        print("Hiç olay kaydedilmedi, makro kaydedilmiyor.")
        return

    isim = input("Makroya bir isim ver (varsayılan: makro1): ").strip() or "makro1"
    makro_kaydet(olaylar, isim)


def oynatma_akisi():
    makrolar = makrolari_listele()
    if not makrolar:
        print("Henüz kayıtlı makro yok. Önce bir kayıt yap (menüden 1).")
        return

    print()
    print("Kayıtlı makrolar:")
    for i, isim in enumerate(makrolar, 1):
        print(f"  {i}. {isim}")
    secim = sayi_sor("Hangi makroyu oynatayım? (numara): ", 1, en_az=1)
    if secim > len(makrolar):
        secim = 1
    isim = makrolar[secim - 1]

    olaylar = makro_yukle(isim)
    print(f"'{isim}' yüklendi ({len(olaylar)} olay).")

    tekrar = sayi_sor("Kaç kez tekrar edilsin? (0 = sen durdurana kadar sonsuz, varsayılan 1): ", 1)
    hiz = ondalik_sor("Oynatma hızı? (1 = normal, 2 = iki kat hızlı, varsayılan 1): ", 1.0)

    oynatici = Oynatici(olaylar, hiz=hiz)
    oynatici.oynat(tekrar=tekrar)


def ana_menu():
    print("=" * 52)
    print("   MAKRO BOTU — Kaydet ve Oynat")
    print("   F9: kaydı başlat/durdur   ESC: oynatmayı durdur")
    print("=" * 52)

    while True:
        print()
        print("1. Yeni makro kaydet")
        print("2. Makro oynat")
        print("3. Kayıtlı makroları listele")
        print("4. Çıkış")
        secim = input("Seçimin (1-4): ").strip()

        if secim == "1":
            kayit_akisi()
        elif secim == "2":
            oynatma_akisi()
        elif secim == "3":
            makrolar = makrolari_listele()
            if makrolar:
                print("Kayıtlı makrolar: " + ", ".join(makrolar))
            else:
                print("Henüz kayıtlı makro yok.")
        elif secim == "4":
            print("Görüşürüz!")
            break
        else:
            print("Geçersiz seçim, 1-4 arası bir numara gir.")


if __name__ == "__main__":
    try:
        ana_menu()
    except KeyboardInterrupt:
        print("\nÇıkılıyor...")
