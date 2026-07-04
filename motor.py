# -*- coding: utf-8 -*-
"""
Tarif motoru — adımları sırasıyla uygular.
Butonları koordinatla değil, EKRAN GÖRÜNTÜSÜYLE tanır: butonun küçük resmi
ekranda aranır, bulunduğu yere tıklanır. Buton yer değiştirse de çalışır.
"""

import os
import time
import threading

import pyautogui

try:
    from pynput import keyboard as pynput_klavye
except ImportError:
    pynput_klavye = None

# Acil durdurma: fareyi ekranın SOL ÜST köşesine fırlatırsan bot anında durur
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.05

TARIF_KLASORU = "tarifler"
BUTON_KLASORU = "butonlar"


class AdimHatasi(Exception):
    """Bir adım uygulanamadığında fırlatılır (örn. buton bulunamadı)."""


def butonu_bul(resim_yolu, guven=0.85):
    """Ekranda resmi arar; bulursa merkez noktasını döndürür, yoksa None."""
    try:
        return pyautogui.locateCenterOnScreen(resim_yolu, confidence=guven)
    except TypeError:
        # opencv kurulu değilse 'confidence' parametresi desteklenmez
        try:
            return pyautogui.locateCenterOnScreen(resim_yolu)
        except Exception:
            return None
    except Exception:
        # yeni pyautogui sürümleri bulamayınca hata fırlatıyor
        return None


class TarifCalistirici:
    """Adım listesini uygular. ESC ile veya durdur() ile durdurulabilir."""

    def __init__(self, adimlar, durum_yaz=None):
        self.adimlar = adimlar
        self.durum_yaz = durum_yaz or (lambda mesaj: None)
        self.durduruldu = threading.Event()
        self._yazici = pynput_klavye.Controller() if pynput_klavye else None

    def durdur(self):
        self.durduruldu.set()

    def _esc_dinleyici(self):
        if not pynput_klavye:
            return None

        def basildi(key):
            if key == pynput_klavye.Key.esc:
                self.durduruldu.set()
                return False

        dinleyici = pynput_klavye.Listener(on_press=basildi)
        dinleyici.start()
        return dinleyici

    def _bekle(self, saniye):
        """durduruldu olayını bekleyerek uyur; True dönerse durdurulmuştur."""
        return self.durduruldu.wait(timeout=saniye)

    # ------------------------------------------------------------- adımlar

    def _adim_uygula(self, no, adim):
        tip = adim["tip"]

        if tip == "bekle":
            self.durum_yaz(f"{no}. adım: {adim['sure']} sn bekleniyor...")
            return not self._bekle(float(adim["sure"]))

        if tip == "yazi":
            self.durum_yaz(f"{no}. adım: yazı yazılıyor...")
            metin = adim["metin"]
            if self._yazici:
                self._yazici.type(metin)  # Türkçe karakter destekli
            else:
                pyautogui.write(metin, interval=0.02)
            return True

        if tip == "tus":
            self.durum_yaz(f"{no}. adım: '{adim['tus']}' tuşuna basılıyor")
            pyautogui.press(adim["tus"])
            return True

        if tip == "butona_tikla":
            resim = adim["resim"]
            ad = os.path.splitext(os.path.basename(resim))[0]
            zaman_asimi = float(adim.get("zaman_asimi", 10))
            self.durum_yaz(f"{no}. adım: '{ad}' butonu ekranda aranıyor...")

            son = time.time() + zaman_asimi
            nokta = None
            while time.time() < son and not self.durduruldu.is_set():
                nokta = butonu_bul(resim)
                if nokta:
                    break
                if self._bekle(0.5):
                    return False
            if self.durduruldu.is_set():
                return False
            if not nokta:
                if adim.get("zorunlu", True):
                    raise AdimHatasi(
                        f"'{ad}' butonu {zaman_asimi:.0f} sn içinde ekranda bulunamadı. "
                        f"Butonun göründüğünden ve pencerenin açık olduğundan emin ol."
                    )
                self.durum_yaz(f"{no}. adım: '{ad}' bulunamadı, atlandı.")
                return True

            x, y = int(nokta.x), int(nokta.y)
            tiklama = adim.get("tiklama", "sol")
            pyautogui.moveTo(x, y, duration=0.2)
            if tiklama == "cift":
                pyautogui.doubleClick(x, y)
            elif tiklama == "sag":
                pyautogui.rightClick(x, y)
            else:
                pyautogui.click(x, y)
            self.durum_yaz(f"{no}. adım: '{ad}' tıklandı ({x}, {y}).")
            return True

        raise AdimHatasi(f"Bilinmeyen adım tipi: {tip}")

    # ------------------------------------------------------------ çalıştır

    def calistir(self, tekrar=1):
        """tekrar=0 → durdurulana kadar sonsuz. Dönüş: (başarılı_mı, mesaj)."""
        dinleyici = self._esc_dinleyici()
        tur = 0
        try:
            while not self.durduruldu.is_set():
                tur += 1
                etiket = f"{tur}" if tekrar == 0 else f"{tur}/{tekrar}"
                self.durum_yaz(f"— Tur {etiket} —")
                for no, adim in enumerate(self.adimlar, 1):
                    if self.durduruldu.is_set():
                        break
                    if not self._adim_uygula(no, adim):
                        break
                if tekrar != 0 and tur >= tekrar:
                    break
            if self.durduruldu.is_set():
                return False, "Durduruldu (ESC)."
            return True, f"Tamamlandı ({tur} tur)."
        except AdimHatasi as hata:
            return False, str(hata)
        except pyautogui.FailSafeException:
            return False, "Acil durdurma: fare sol üst köşeye götürüldü."
        finally:
            if dinleyici:
                dinleyici.stop()


# ---------------------------------------------------------------- dosyalar

import json


def tarif_kaydet(adimlar, yol):
    os.makedirs(os.path.dirname(yol) or ".", exist_ok=True)
    with open(yol, "w", encoding="utf-8") as f:
        json.dump({"surum": 1, "adimlar": adimlar}, f, ensure_ascii=False, indent=2)


def tarif_yukle(yol):
    with open(yol, "r", encoding="utf-8") as f:
        return json.load(f)["adimlar"]
