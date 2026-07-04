# -*- coding: utf-8 -*-
"""
Tarif motoru (PRO) — adımları sırasıyla uygular.

Butonları koordinatla değil EKRAN GÖRÜNTÜSÜYLE tanır: butonun küçük resmi
ekranda aranır, bulunduğu yere tıklanır. Buton yer değiştirse de çalışır.

Adım tipleri:
    butona_tikla   : resmi ekranda bul ve tıkla (sol/çift/sağ, kaydırma, hassasiyet)
    buton_bekle    : resim görünene ya da kaybolana kadar bekle
    tikla_koordinat: sabit (x, y) noktasına tıkla
    bekle          : sabit süre bekle
    rastgele_bekle : iki değer arasında rastgele süre bekle
    yazi           : metin yaz (Türkçe destekli)
    tus            : tek tuşa bas (istenirse N kez)
    kisayol        : tuş kombinasyonu (ctrl+c gibi)
    kaydir         : fare tekerleğini kaydır
    ses            : bip sesi çal
"""

import json
import os
import random
import threading
import time

import pyautogui

try:
    from pynput import keyboard as pynput_klavye
except ImportError:
    pynput_klavye = None

# Acil durdurma: fareyi ekranın SOL ÜST köşesine fırlatırsan bot anında durur
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.02

TARIF_KLASORU = "tarifler"
BUTON_KLASORU = "butonlar"
AYAR_DOSYASI = "ayarlar.json"

VARSAYILAN_AYARLAR = {
    "guven": 0.85,        # görüntü tanıma hassasiyeti (0.5 - 0.99)
    "fare_hizi": 0.2,     # fare hedefe kaç saniyede gitsin (0 = ışınlan)
    "adim_arasi": 0.05,   # her adım arasına eklenen bekleme (sn)
    "tur_arasi": 0.0,     # tekrarlar (turlar) arası bekleme (sn)
    "geri_sayim": 3,      # BAŞLAT'a basınca kaç sn geri sayım
    "insansi": False,     # insansı mod: küçük rastgele sapma ve gecikmeler
    "baslat_tusu": "f8",  # global başlat kısayolu
    "durdur_tusu": "esc", # global durdur kısayolu
}


# ---------------------------------------------------------------- ayarlar

def ayarlari_yukle():
    ayarlar = dict(VARSAYILAN_AYARLAR)
    try:
        with open(AYAR_DOSYASI, "r", encoding="utf-8") as f:
            ayarlar.update(json.load(f))
    except (OSError, ValueError):
        pass
    return ayarlar


def ayarlari_kaydet(ayarlar):
    with open(AYAR_DOSYASI, "w", encoding="utf-8") as f:
        json.dump(ayarlar, f, ensure_ascii=False, indent=2)


def ozel_tus(ad):
    """'f8', 'esc' gibi bir adı pynput Key nesnesine çevirir."""
    if not pynput_klavye:
        return None
    try:
        return getattr(pynput_klavye.Key, ad)
    except AttributeError:
        return None


# ------------------------------------------------------------ görüntü arama

class AdimHatasi(Exception):
    """Bir adım uygulanamadığında fırlatılır (örn. buton bulunamadı)."""


def butonu_bul(resim_yolu, guven=0.85):
    """Ekranda resmi arar; bulursa merkez noktasını döndürür, yoksa None."""
    if not os.path.exists(resim_yolu):
        raise AdimHatasi(f"Buton resmi bulunamadı: {resim_yolu}")
    try:
        return pyautogui.locateCenterOnScreen(resim_yolu, confidence=guven)
    except TypeError:
        # opencv kurulu değilse 'confidence' parametresi desteklenmez
        try:
            return pyautogui.locateCenterOnScreen(resim_yolu)
        except Exception:
            return None
    except AdimHatasi:
        raise
    except Exception:
        # yeni pyautogui sürümleri bulamayınca hata fırlatıyor
        return None


def bip():
    try:
        import winsound
        winsound.Beep(880, 250)
    except Exception:
        print("\a", end="", flush=True)


# --------------------------------------------------------------- çalıştırıcı

class TarifCalistirici:
    """Adım listesini uygular. Kısayol tuşuyla veya durdur() ile durdurulabilir."""

    def __init__(self, adimlar, ayarlar=None, durum_yaz=None):
        self.adimlar = adimlar
        self.ayarlar = {**VARSAYILAN_AYARLAR, **(ayarlar or {})}
        self.durum_yaz = durum_yaz or (lambda mesaj: None)
        self.durduruldu = threading.Event()
        self._yazici = pynput_klavye.Controller() if pynput_klavye else None

    def durdur(self):
        self.durduruldu.set()

    # ------------------------------------------------------------ yardımcı

    def _durdurma_dinleyici(self):
        if not pynput_klavye:
            return None
        hedef = ozel_tus(self.ayarlar["durdur_tusu"])

        def basildi(key):
            if key == hedef:
                self.durduruldu.set()
                return False

        dinleyici = pynput_klavye.Listener(on_press=basildi)
        dinleyici.start()
        return dinleyici

    def _bekle(self, saniye):
        """durduruldu olayını bekleyerek uyur; True dönerse durdurulmuştur."""
        if saniye <= 0:
            return self.durduruldu.is_set()
        return self.durduruldu.wait(timeout=saniye)

    def _sapma(self):
        """İnsansı modda tıklamaya küçük rastgele kayma ekler."""
        if self.ayarlar["insansi"]:
            return random.randint(-3, 3), random.randint(-3, 3)
        return 0, 0

    def _insansi_gecikme(self):
        if self.ayarlar["insansi"]:
            self._bekle(random.uniform(0.05, 0.3))

    def _tikla(self, x, y, tiklama):
        sx, sy = self._sapma()
        x, y = int(x) + sx, int(y) + sy
        hiz = float(self.ayarlar["fare_hizi"])
        if hiz > 0:
            pyautogui.moveTo(x, y, duration=hiz)
        else:
            pyautogui.moveTo(x, y)
        self._insansi_gecikme()
        if tiklama == "cift":
            pyautogui.doubleClick(x, y)
        elif tiklama == "sag":
            pyautogui.rightClick(x, y)
        else:
            pyautogui.click(x, y)

    def _resim_ara(self, resim, guven, zaman_asimi, kaybolana=False):
        """Resim görünene (veya kaybolana) kadar bekler. Nokta ya da None döndürür."""
        son = time.time() + zaman_asimi
        while time.time() < son and not self.durduruldu.is_set():
            nokta = butonu_bul(resim, guven)
            if kaybolana:
                if nokta is None:
                    return True
            elif nokta:
                return nokta
            if self._bekle(0.4):
                return None
        return None

    # ------------------------------------------------------------- adımlar

    def _adim_uygula(self, no, adim):
        tip = adim["tip"]

        if tip == "bekle":
            self.durum_yaz(f"{no}. adım: {adim['sure']} sn bekleniyor...")
            return not self._bekle(float(adim["sure"]))

        if tip == "rastgele_bekle":
            sure = random.uniform(float(adim["en_az"]), float(adim["en_cok"]))
            self.durum_yaz(f"{no}. adım: rastgele {sure:.1f} sn bekleniyor...")
            return not self._bekle(sure)

        if tip == "yazi":
            self.durum_yaz(f"{no}. adım: yazı yazılıyor...")
            metin = adim["metin"]
            if self._yazici:
                self._yazici.type(metin)  # Türkçe karakter destekli
            else:
                pyautogui.write(metin, interval=0.02)
            return True

        if tip == "tus":
            kac = int(adim.get("tekrar", 1))
            self.durum_yaz(f"{no}. adım: '{adim['tus']}' tuşu ({kac} kez)")
            pyautogui.press(adim["tus"], presses=kac, interval=0.05)
            return True

        if tip == "kisayol":
            tuslar = adim["tuslar"]
            self.durum_yaz(f"{no}. adım: kısayol {'+'.join(tuslar)}")
            pyautogui.hotkey(*tuslar)
            return True

        if tip == "kaydir":
            miktar = int(adim["miktar"]) * 120
            if adim.get("yon", "asagi") == "asagi":
                miktar = -miktar
            self.durum_yaz(f"{no}. adım: tekerlek kaydırılıyor ({adim['yon']})")
            pyautogui.scroll(miktar)
            return True

        if tip == "ses":
            self.durum_yaz(f"{no}. adım: bip!")
            bip()
            return True

        if tip == "tikla_koordinat":
            x, y = adim["x"], adim["y"]
            self.durum_yaz(f"{no}. adım: ({x}, {y}) noktasına tıklanıyor")
            self._tikla(x, y, adim.get("tiklama", "sol"))
            return True

        if tip == "buton_bekle":
            resim = adim["resim"]
            ad = os.path.splitext(os.path.basename(resim))[0]
            kaybolana = adim.get("mod", "gorunene") == "kaybolana"
            zaman_asimi = float(adim.get("zaman_asimi", 30))
            guven = float(adim.get("guven", self.ayarlar["guven"]))
            ne = "kaybolması" if kaybolana else "görünmesi"
            self.durum_yaz(f"{no}. adım: '{ad}' butonunun {ne} bekleniyor...")
            sonuc = self._resim_ara(resim, guven, zaman_asimi, kaybolana=kaybolana)
            if self.durduruldu.is_set():
                return False
            if sonuc is None:
                raise AdimHatasi(
                    f"'{ad}' butonunun {ne} {zaman_asimi:.0f} sn içinde gerçekleşmedi."
                )
            return True

        if tip == "butona_tikla":
            resim = adim["resim"]
            ad = os.path.splitext(os.path.basename(resim))[0]
            zaman_asimi = float(adim.get("zaman_asimi", 10))
            guven = float(adim.get("guven", self.ayarlar["guven"]))
            self.durum_yaz(f"{no}. adım: '{ad}' butonu ekranda aranıyor...")

            nokta = self._resim_ara(resim, guven, zaman_asimi)
            if self.durduruldu.is_set():
                return False
            if not nokta:
                if adim.get("bulunamazsa", "hata") == "atla":
                    self.durum_yaz(f"{no}. adım: '{ad}' bulunamadı, atlandı.")
                    return True
                raise AdimHatasi(
                    f"'{ad}' butonu {zaman_asimi:.0f} sn içinde ekranda bulunamadı. "
                    f"Butonun göründüğünden emin ol; gerekirse hassasiyeti düşür."
                )

            x = int(nokta.x) + int(adim.get("kaydir_x", 0))
            y = int(nokta.y) + int(adim.get("kaydir_y", 0))
            self._tikla(x, y, adim.get("tiklama", "sol"))
            self.durum_yaz(f"{no}. adım: '{ad}' tıklandı ({x}, {y}).")
            return True

        raise AdimHatasi(f"Bilinmeyen adım tipi: {tip}")

    # ------------------------------------------------------------ çalıştır

    def calistir(self, tekrar=1):
        """tekrar=0 → durdurulana kadar sonsuz. Dönüş: (başarılı_mı, mesaj)."""
        dinleyici = self._durdurma_dinleyici()
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
                    if self._bekle(float(self.ayarlar["adim_arasi"])):
                        break
                if tekrar != 0 and tur >= tekrar:
                    break
                if self._bekle(float(self.ayarlar["tur_arasi"])):
                    break
            if self.durduruldu.is_set():
                return False, f"Durduruldu ({self.ayarlar['durdur_tusu'].upper()})."
            return True, f"Tamamlandı ({tur} tur)."
        except AdimHatasi as hata:
            return False, str(hata)
        except pyautogui.FailSafeException:
            return False, "Acil durdurma: fare sol üst köşeye götürüldü."
        finally:
            if dinleyici:
                dinleyici.stop()


# ----------------------------------------------------------------- dosyalar

def tarif_kaydet(adimlar, yol):
    os.makedirs(os.path.dirname(yol) or ".", exist_ok=True)
    with open(yol, "w", encoding="utf-8") as f:
        json.dump({"surum": 2, "adimlar": adimlar}, f, ensure_ascii=False, indent=2)


def tarif_yukle(yol):
    with open(yol, "r", encoding="utf-8") as f:
        return json.load(f)["adimlar"]
