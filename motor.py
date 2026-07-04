# -*- coding: utf-8 -*-
"""
Tarif motoru (PRO) — adımları sırasıyla uygular.

Butonları koordinatla değil EKRAN GÖRÜNTÜSÜYLE tanır. Akıllı arama açıkken
buton farklı boyutlarda da aranır (çözünürlük/zoom değişse bile bulunur).

Adım tipleri:
    butona_tikla    : resmi ekranda bul ve tıkla (tek ya da TÜM eşleşmeler)
    buton_bekle     : resim görünene ya da kaybolana kadar bekle
    gorunca_git     : resim görünüyorsa (veya görünmüyorsa) başka adıma atla
    don             : belirtilen adıma geri dön (en fazla N kez) → döngü
    tikla_koordinat : sabit (x, y) noktasına tıkla
    bekle           : sabit süre bekle
    rastgele_bekle  : iki değer arasında rastgele süre bekle
    yazi            : metin yaz (Türkçe destekli)
    tus             : tek tuşa bas (istenirse N kez)
    kisayol         : tuş kombinasyonu (ctrl+c gibi)
    kaydir          : fare tekerleğini kaydır
    pencere_getir   : başlığında verilen metin geçen pencereyi öne getir
    ac              : program ya da web sitesi aç
    pano            : metni panoya kopyala (istenirse yapıştır)
    ekran_goruntusu : ekran görüntüsünü dosyaya kaydet
    renk_bekle      : bir noktanın rengi olana/gidene kadar bekle
    ses             : bip sesi çal
"""

import json
import os
import random
import threading
import time
from collections import namedtuple

import pyautogui

try:
    from pynput import keyboard as pynput_klavye
except ImportError:
    pynput_klavye = None

try:
    import pyperclip
except ImportError:
    pyperclip = None

try:
    import pygetwindow
except ImportError:
    pygetwindow = None

# Acil durdurma: fareyi ekranın SOL ÜST köşesine fırlatırsan bot anında durur
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.02

TARIF_KLASORU = "tarifler"
BUTON_KLASORU = "butonlar"
EKRAN_KLASORU = "ekranlar"
HATA_KLASORU = "hatalar"
AYAR_DOSYASI = "ayarlar.json"

VARSAYILAN_AYARLAR = {
    "guven": 0.85,          # görüntü tanıma hassasiyeti (0.5 - 0.99)
    "fare_hizi": 0.2,       # fare hedefe kaç saniyede gitsin (0 = ışınlan)
    "adim_arasi": 0.05,     # her adım arasına eklenen bekleme (sn)
    "tur_arasi": 0.0,       # tekrarlar (turlar) arası bekleme (sn)
    "geri_sayim": 3,        # BAŞLAT'a basınca kaç sn geri sayım
    "insansi": False,       # insansı mod: küçük rastgele sapma ve gecikmeler
    "baslat_tusu": "f8",    # global başlat kısayolu
    "durdur_tusu": "esc",   # global durdur kısayolu
    "akilli_arama": True,   # bulamazsa farklı boyutlarda da ara (zoom/çözünürlük)
    "gri_ton": False,       # gri tonlamalı hızlı arama
    "hata_goruntusu": True, # hata olunca ekran görüntüsünü hatalar/ içine kaydet
    "bitis_sesi": True,     # iş bitince bip sesi çal
}

Nokta = namedtuple("Nokta", "x y")


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


def _coklu_olcek_bul(resim_yolu, guven):
    """Şablonu farklı boyutlarda arar (zoom/çözünürlük değişse de bulur)."""
    try:
        import cv2
        import numpy as np
    except ImportError:
        return None
    sablon = cv2.imread(resim_yolu, cv2.IMREAD_GRAYSCALE)
    if sablon is None:
        return None
    ekran = cv2.cvtColor(np.array(pyautogui.screenshot()), cv2.COLOR_RGB2GRAY)

    en_iyi = None
    for olcek in (0.7, 0.8, 0.9, 1.1, 1.2, 1.3):
        s = cv2.resize(sablon, None, fx=olcek, fy=olcek)
        if s.shape[0] >= ekran.shape[0] or s.shape[1] >= ekran.shape[1]:
            continue
        sonuc = cv2.matchTemplate(ekran, s, cv2.TM_CCOEFF_NORMED)
        _, deger, _, konum = cv2.minMaxLoc(sonuc)
        if en_iyi is None or deger > en_iyi[0]:
            en_iyi = (deger, konum, s.shape)
    if en_iyi and en_iyi[0] >= guven:
        (h, w) = en_iyi[2]
        return Nokta(en_iyi[1][0] + w // 2, en_iyi[1][1] + h // 2)
    return None


def butonu_bul(resim_yolu, guven=0.85, gri=False, akilli=False):
    """Ekranda resmi arar; bulursa merkez noktasını döndürür, yoksa None."""
    if not os.path.exists(resim_yolu):
        raise AdimHatasi(f"Buton resmi bulunamadı: {resim_yolu}")
    nokta = None
    try:
        nokta = pyautogui.locateCenterOnScreen(resim_yolu, confidence=guven,
                                               grayscale=gri)
    except TypeError:
        # opencv kurulu değilse 'confidence' parametresi desteklenmez
        try:
            nokta = pyautogui.locateCenterOnScreen(resim_yolu)
        except Exception:
            nokta = None
    except AdimHatasi:
        raise
    except Exception:
        nokta = None
    if nokta is None and akilli:
        nokta = _coklu_olcek_bul(resim_yolu, guven)
    return nokta


def hepsini_bul(resim_yolu, guven=0.85, gri=False):
    """Ekrandaki TÜM eşleşmelerin merkezlerini döndürür."""
    if not os.path.exists(resim_yolu):
        raise AdimHatasi(f"Buton resmi bulunamadı: {resim_yolu}")
    try:
        kutular = list(pyautogui.locateAllOnScreen(resim_yolu, confidence=guven,
                                                   grayscale=gri))
    except TypeError:
        try:
            kutular = list(pyautogui.locateAllOnScreen(resim_yolu))
        except Exception:
            return []
    except Exception:
        return []
    merkezler = []
    for k in kutular:
        x, y = k.left + k.width // 2, k.top + k.height // 2
        if all(abs(x - mx) > 10 or abs(y - my) > 10 for mx, my in merkezler):
            merkezler.append((x, y))
    return merkezler


def bip():
    try:
        import winsound
        winsound.Beep(880, 250)
    except Exception:
        print("\a", end="", flush=True)


def hata_goruntusu_kaydet():
    """Hata anındaki ekranı hatalar/ klasörüne kaydeder, yolunu döndürür."""
    try:
        os.makedirs(HATA_KLASORU, exist_ok=True)
        yol = os.path.join(HATA_KLASORU, time.strftime("hata_%Y%m%d_%H%M%S.png"))
        pyautogui.screenshot().save(yol)
        return yol
    except Exception:
        return None


# --------------------------------------------------------------- çalıştırıcı

class TarifCalistirici:
    """Adım listesini uygular. Kısayol tuşuyla veya durdur() ile durdurulabilir."""

    def __init__(self, adimlar, ayarlar=None, durum_yaz=None):
        self.adimlar = adimlar
        self.ayarlar = {**VARSAYILAN_AYARLAR, **(ayarlar or {})}
        self.durum_yaz = durum_yaz or (lambda mesaj: None)
        self.durduruldu = threading.Event()
        self._yazici = pynput_klavye.Controller() if pynput_klavye else None
        self._don_sayaclari = {}

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

    def _ara(self, resim, guven, zaman_asimi, kaybolana=False):
        """Resim görünene (veya kaybolana) kadar bekler."""
        gri = bool(self.ayarlar["gri_ton"])
        akilli = bool(self.ayarlar["akilli_arama"])
        son = time.time() + zaman_asimi
        while time.time() < son and not self.durduruldu.is_set():
            nokta = butonu_bul(resim, guven, gri=gri, akilli=akilli)
            if kaybolana:
                if nokta is None:
                    return True
            elif nokta:
                return nokta
            if self._bekle(0.4):
                return None
        return None

    @staticmethod
    def _resim_adi(adim):
        return os.path.splitext(os.path.basename(adim["resim"]))[0]

    def _hedef_dogrula(self, adim, no):
        hedef = int(adim["hedef"])
        if not (1 <= hedef <= len(self.adimlar)):
            raise AdimHatasi(
                f"{no}. adım: hedef adım ({hedef}) yok — tarifte {len(self.adimlar)} adım var."
            )
        return hedef - 1

    # ------------------------------------------------------------- adımlar

    def _adim_uygula(self, indeks, adim):
        """True → sıradaki adım, False → durduruldu, ('git', i) → atla."""
        no = indeks + 1
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

        if tip == "pencere_getir":
            baslik = adim["baslik"]
            self.durum_yaz(f"{no}. adım: '{baslik}' penceresi öne getiriliyor...")
            pencere = None
            if pygetwindow:
                try:
                    for p in pygetwindow.getAllWindows():
                        if p.title and baslik.lower() in p.title.lower():
                            pencere = p
                            break
                except Exception:
                    pencere = None
            if pencere:
                try:
                    if pencere.isMinimized:
                        pencere.restore()
                    pencere.activate()
                except Exception:
                    pass
                self._bekle(0.5)
                return True
            if adim.get("bulunamazsa") == "atla":
                self.durum_yaz(f"{no}. adım: pencere bulunamadı, atlandı.")
                return True
            raise AdimHatasi(f"Başlığında '{baslik}' geçen açık pencere bulunamadı.")

        if tip == "ac":
            hedef = adim["yol"].strip()
            self.durum_yaz(f"{no}. adım: açılıyor → {hedef}")
            try:
                if hedef.startswith(("http://", "https://", "www.")):
                    import webbrowser
                    if hedef.startswith("www."):
                        hedef = "https://" + hedef
                    webbrowser.open(hedef)
                else:
                    os.startfile(hedef)  # Windows
            except AttributeError:
                import subprocess
                subprocess.Popen([hedef])
            except OSError as hata:
                raise AdimHatasi(f"Açılamadı: {hedef} ({hata})")
            return True

        if tip == "pano":
            if not pyperclip:
                raise AdimHatasi("pyperclip kurulu değil — kur.bat'ı yeniden çalıştır.")
            self.durum_yaz(f"{no}. adım: panoya kopyalanıyor...")
            pyperclip.copy(adim["metin"])
            if adim.get("yapistir"):
                self._bekle(0.1)
                pyautogui.hotkey("ctrl", "v")
            return True

        if tip == "ekran_goruntusu":
            os.makedirs(EKRAN_KLASORU, exist_ok=True)
            yol = os.path.join(EKRAN_KLASORU,
                               time.strftime("ekran_%Y%m%d_%H%M%S.png"))
            pyautogui.screenshot().save(yol)
            self.durum_yaz(f"{no}. adım: ekran görüntüsü kaydedildi → {yol}")
            return True

        if tip == "renk_bekle":
            x, y = int(adim["x"]), int(adim["y"])
            hedef = tuple(adim["renk"])
            tolerans = int(adim.get("tolerans", 12))
            gidene = adim.get("mod") == "gidene"
            zaman_asimi = float(adim.get("zaman_asimi", 30))
            ne = "gitmesi" if gidene else "gelmesi"
            self.durum_yaz(f"{no}. adım: ({x},{y}) noktasında rengin {ne} bekleniyor...")
            son = time.time() + zaman_asimi
            while time.time() < son and not self.durduruldu.is_set():
                piksel = pyautogui.screenshot().getpixel((x, y))[:3]
                uydu = all(abs(piksel[k] - hedef[k]) <= tolerans for k in range(3))
                if uydu != gidene:
                    return True
                if self._bekle(0.4):
                    return False
            if self.durduruldu.is_set():
                return False
            raise AdimHatasi(
                f"({x},{y}) noktasında beklenen renk değişimi {zaman_asimi:.0f} sn içinde olmadı."
            )

        if tip == "don":
            kez = int(adim.get("kez", 1))
            sayac = self._don_sayaclari.get(indeks, 0)
            if sayac < kez:
                self._don_sayaclari[indeks] = sayac + 1
                hedef = self._hedef_dogrula(adim, no)
                self.durum_yaz(
                    f"{no}. adım: {adim['hedef']}. adıma dönülüyor ({sayac + 1}/{kez})")
                return ("git", hedef)
            self.durum_yaz(f"{no}. adım: döngü tamamlandı, devam ediliyor.")
            return True

        if tip == "gorunca_git":
            ad = self._resim_adi(adim)
            guven = float(adim.get("guven", self.ayarlar["guven"]))
            nokta = butonu_bul(adim["resim"], guven,
                               gri=bool(self.ayarlar["gri_ton"]),
                               akilli=bool(self.ayarlar["akilli_arama"]))
            gorundu = nokta is not None
            kosul = gorundu if adim.get("mod", "gorunurse") == "gorunurse" else not gorundu
            if kosul:
                hedef = self._hedef_dogrula(adim, no)
                durum = "görünüyor" if gorundu else "görünmüyor"
                self.durum_yaz(f"{no}. adım: '{ad}' {durum} → {adim['hedef']}. adıma atlanıyor")
                return ("git", hedef)
            self.durum_yaz(f"{no}. adım: koşul sağlanmadı, devam.")
            return True

        if tip == "buton_bekle":
            ad = self._resim_adi(adim)
            kaybolana = adim.get("mod", "gorunene") == "kaybolana"
            zaman_asimi = float(adim.get("zaman_asimi", 30))
            guven = float(adim.get("guven", self.ayarlar["guven"]))
            ne = "kaybolması" if kaybolana else "görünmesi"
            self.durum_yaz(f"{no}. adım: '{ad}' butonunun {ne} bekleniyor...")
            sonuc = self._ara(adim["resim"], guven, zaman_asimi, kaybolana=kaybolana)
            if self.durduruldu.is_set():
                return False
            if sonuc is None:
                raise AdimHatasi(f"'{ad}' butonunun {ne} {zaman_asimi:.0f} sn içinde gerçekleşmedi.")
            return True

        if tip == "butona_tikla":
            ad = self._resim_adi(adim)
            zaman_asimi = float(adim.get("zaman_asimi", 10))
            guven = float(adim.get("guven", self.ayarlar["guven"]))
            kx, ky = int(adim.get("kaydir_x", 0)), int(adim.get("kaydir_y", 0))
            tiklama = adim.get("tiklama", "sol")

            if adim.get("hepsi"):
                self.durum_yaz(f"{no}. adım: '{ad}' için TÜM eşleşmeler aranıyor...")
                gri = bool(self.ayarlar["gri_ton"])
                son = time.time() + zaman_asimi
                merkezler = []
                while time.time() < son and not self.durduruldu.is_set():
                    merkezler = hepsini_bul(adim["resim"], guven, gri=gri)
                    if merkezler:
                        break
                    if self._bekle(0.4):
                        return False
                if self.durduruldu.is_set():
                    return False
                if not merkezler:
                    if adim.get("bulunamazsa") == "atla":
                        self.durum_yaz(f"{no}. adım: '{ad}' bulunamadı, atlandı.")
                        return True
                    raise AdimHatasi(f"'{ad}' butonu {zaman_asimi:.0f} sn içinde bulunamadı.")
                for x, y in merkezler:
                    if self.durduruldu.is_set():
                        return False
                    self._tikla(x + kx, y + ky, tiklama)
                self.durum_yaz(f"{no}. adım: {len(merkezler)} eşleşmeye tıklandı.")
                return True

            self.durum_yaz(f"{no}. adım: '{ad}' butonu ekranda aranıyor...")
            nokta = self._ara(adim["resim"], guven, zaman_asimi)
            if self.durduruldu.is_set():
                return False
            if not nokta:
                if adim.get("bulunamazsa") == "atla":
                    self.durum_yaz(f"{no}. adım: '{ad}' bulunamadı, atlandı.")
                    return True
                raise AdimHatasi(
                    f"'{ad}' butonu {zaman_asimi:.0f} sn içinde ekranda bulunamadı. "
                    f"Butonun göründüğünden emin ol; gerekirse hassasiyeti düşür."
                )
            x, y = int(nokta.x) + kx, int(nokta.y) + ky
            self._tikla(x, y, tiklama)
            self.durum_yaz(f"{no}. adım: '{ad}' tıklandı ({x}, {y}).")
            return True

        raise AdimHatasi(f"Bilinmeyen adım tipi: {tip}")

    # ------------------------------------------------------------ çalıştır

    def calistir(self, tekrar=1):
        """tekrar=0 → durdurulana kadar sonsuz. Dönüş: (başarılı_mı, mesaj)."""
        dinleyici = self._durdurma_dinleyici()
        tur = 0
        baslangic = time.time()
        try:
            while not self.durduruldu.is_set():
                tur += 1
                etiket = f"{tur}" if tekrar == 0 else f"{tur}/{tekrar}"
                self.durum_yaz(f"— Tur {etiket} —")
                self._don_sayaclari = {}

                i = 0
                atlama_sayisi = 0
                while i < len(self.adimlar) and not self.durduruldu.is_set():
                    sonuc = self._adim_uygula(i, self.adimlar[i])
                    if sonuc is False:
                        break
                    if isinstance(sonuc, tuple):
                        i = sonuc[1]
                        atlama_sayisi += 1
                        if atlama_sayisi > 10000:
                            raise AdimHatasi(
                                "Sonsuz döngü algılandı (10.000 atlama) — tarifi kontrol et.")
                    else:
                        i += 1
                    if self._bekle(float(self.ayarlar["adim_arasi"])):
                        break

                if tekrar != 0 and tur >= tekrar:
                    break
                if self._bekle(float(self.ayarlar["tur_arasi"])):
                    break

            sure = time.time() - baslangic
            if self.durduruldu.is_set():
                return False, f"Durduruldu ({self.ayarlar['durdur_tusu'].upper()}) — {tur} tur, {sure:.0f} sn."
            return True, f"Tamamlandı — {tur} tur, {sure:.0f} sn."
        except AdimHatasi as hata:
            mesaj = str(hata)
            if self.ayarlar.get("hata_goruntusu"):
                yol = hata_goruntusu_kaydet()
                if yol:
                    mesaj += f"  [ekran görüntüsü: {yol}]"
            return False, mesaj
        except pyautogui.FailSafeException:
            return False, "Acil durdurma: fare sol üst köşeye götürüldü."
        finally:
            if dinleyici:
                dinleyici.stop()


# ----------------------------------------------------------------- dosyalar

def tarif_kaydet(adimlar, yol):
    os.makedirs(os.path.dirname(yol) or ".", exist_ok=True)
    with open(yol, "w", encoding="utf-8") as f:
        json.dump({"surum": 3, "adimlar": adimlar}, f, ensure_ascii=False, indent=2)


def tarif_yukle(yol):
    with open(yol, "r", encoding="utf-8") as f:
        return json.load(f)["adimlar"]


def acik_pencere_basliklari():
    """Açık pencere başlıklarını döndürür (pencere seçim listesi için)."""
    if not pygetwindow:
        return []
    try:
        return sorted({p for p in pygetwindow.getAllTitles() if p and p.strip()})
    except Exception:
        return []
