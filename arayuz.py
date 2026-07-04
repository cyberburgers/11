# -*- coding: utf-8 -*-
"""
Buton Botu PRO — Modern arayüz

Tarifi kurarsın: "şu butona tıkla → 2 sn bekle → şunu yaz → Enter"
Bot butonları EKRANDA GÖRÜNTÜSÜNDEN TANIR ve tarifi sırasıyla uygular.

Çalıştırmak için:  python arayuz.py
Global kısayollar (Ayarlar'dan değiştirilebilir):  F8 = başlat, ESC = durdur
"""

import os
import sys
import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

try:
    import pyautogui
    from PIL import Image, ImageTk
except ImportError as hata:
    print(f"Eksik kütüphane: {hata}")
    print("Kurmak için kur.bat dosyasına çift tıkla (veya: pip install -r requirements.txt)")
    sys.exit(1)

from motor import (
    TarifCalistirici,
    tarif_kaydet,
    tarif_yukle,
    ayarlari_yukle,
    ayarlari_kaydet,
    ozel_tus,
    TARIF_KLASORU,
    BUTON_KLASORU,
)

try:
    from pynput import keyboard as pynput_klavye
except ImportError:
    pynput_klavye = None

SON_TARIF = os.path.join(TARIF_KLASORU, "_son_calisma.json")

# ------------------------------------------------------------------ tema
ARKA = "#14161f"
KART = "#1e2130"
KART_2 = "#262a3d"
YAZI = "#e8eaf2"
SOLUK = "#8b90a8"
MAVI = "#4f7cff"
YESIL = "#2fbf8f"
KIRMIZI = "#e5484d"
TURUNCU = "#f5a623"

FONT = ("Segoe UI", 10)
FONT_K = ("Segoe UI", 9)
FONT_B = ("Segoe UI", 11, "bold")


def buton_yap(ana, metin, renk, komut, buyuk=False):
    return tk.Button(
        ana, text=metin, command=komut,
        bg=renk, fg="white", activebackground=renk, activeforeground="white",
        relief="flat", bd=0, cursor="hand2",
        font=FONT_B if buyuk else FONT,
        padx=12, pady=8 if buyuk else 5,
    )


def kart_yap(ana, baslik):
    dis = tk.Frame(ana, bg=KART)
    tk.Label(dis, text=baslik, bg=KART, fg=SOLUK, font=("Segoe UI", 9, "bold"),
             anchor="w").pack(fill="x", padx=14, pady=(10, 2))
    return dis


def giris_yap(ana, deger="", genislik=None):
    e = tk.Entry(ana, font=FONT, bg=KART_2, fg=YAZI, insertbackground=YAZI,
                 relief="flat", width=genislik or 20)
    if deger != "":
        e.insert(0, str(deger))
    return e


# ------------------------------------------------------- bölge seçici
class BolgeSecici:
    """Dondurulmuş ekran görüntüsü üzerinde fareyle kutu çizdirir."""

    def __init__(self, kok, resim, bitince):
        self.orijinal = resim
        self.bitince = bitince
        self.top = tk.Toplevel(kok)
        self.top.attributes("-fullscreen", True)
        self.top.attributes("-topmost", True)

        ew = self.top.winfo_screenwidth()
        eh = self.top.winfo_screenheight()
        self.olcek_x = resim.width / ew
        self.olcek_y = resim.height / eh

        gosterim = resim.resize((ew, eh))
        self.foto = ImageTk.PhotoImage(gosterim)

        self.tuval = tk.Canvas(self.top, cursor="cross", highlightthickness=0)
        self.tuval.pack(fill="both", expand=True)
        self.tuval.create_image(0, 0, image=self.foto, anchor="nw")
        self.tuval.create_rectangle(ew // 2 - 330, 12, ew // 2 + 330, 52,
                                    fill=ARKA, outline="")
        self.tuval.create_text(
            ew // 2, 32,
            text="Tanınacak BUTONUN etrafına fareyle kutu çiz  •  İptal: ESC",
            fill="#ffffff", font=("Segoe UI", 13, "bold"),
        )

        self.bas_x = self.bas_y = None
        self.kutu = None
        self.tuval.bind("<ButtonPress-1>", self._bas)
        self.tuval.bind("<B1-Motion>", self._surukle)
        self.tuval.bind("<ButtonRelease-1>", self._birak)
        self.top.bind("<Escape>", lambda e: self._kapat(None))
        self.top.focus_force()

    def _bas(self, olay):
        self.bas_x, self.bas_y = olay.x, olay.y
        self.kutu = self.tuval.create_rectangle(
            olay.x, olay.y, olay.x, olay.y, outline=KIRMIZI, width=3
        )

    def _surukle(self, olay):
        if self.kutu:
            self.tuval.coords(self.kutu, self.bas_x, self.bas_y, olay.x, olay.y)

    def _birak(self, olay):
        if self.bas_x is None:
            return
        x1, x2 = sorted((self.bas_x, olay.x))
        y1, y2 = sorted((self.bas_y, olay.y))
        if x2 - x1 < 8 or y2 - y1 < 8:
            self._kapat(None)
            return
        kirpik = self.orijinal.crop((
            int(x1 * self.olcek_x), int(y1 * self.olcek_y),
            int(x2 * self.olcek_x), int(y2 * self.olcek_y),
        ))
        self._kapat(kirpik)

    def _kapat(self, sonuc):
        self.top.destroy()
        self.bitince(sonuc)


# --------------------------------------------------------- diyalog tabanı
class Diyalog(tk.Toplevel):
    def __init__(self, kok, baslik):
        super().__init__(kok)
        self.title(baslik)
        self.configure(bg=KART)
        self.resizable(False, False)
        self.transient(kok)
        self.grab_set()
        self.sonuc = None
        self.govde = tk.Frame(self, bg=KART, padx=18, pady=14)
        self.govde.pack(fill="both", expand=True)
        self.geometry(f"+{kok.winfo_rootx() + 40}+{kok.winfo_rooty() + 100}")

    def etiket(self, metin):
        tk.Label(self.govde, text=metin, bg=KART, fg=YAZI, font=FONT,
                 anchor="w").pack(fill="x", pady=(8, 2))

    def ipucu(self, metin):
        tk.Label(self.govde, text=metin, bg=KART, fg=SOLUK, font=FONT_K,
                 anchor="w", wraplength=320, justify="left").pack(fill="x")

    def onay_satiri(self, tamam_metni="Tamam"):
        satir = tk.Frame(self.govde, bg=KART)
        satir.pack(fill="x", pady=(14, 0))
        buton_yap(satir, tamam_metni, MAVI, self._tamam).pack(side="right")
        buton_yap(satir, "Vazgeç", KART_2, self._iptal).pack(side="right", padx=(0, 8))
        self.bind("<Return>", lambda e: self._tamam())
        self.bind("<Escape>", lambda e: self._iptal())

    def _tamam(self):
        self.sonuc = self.topla()
        if self.sonuc is not None:
            self.destroy()

    def _iptal(self):
        self.sonuc = None
        self.destroy()

    def topla(self):
        return None


# ---------------------------------------------------- adım diyalogları
TIKLAMA_ADLARI = {"sol": "Sol tık", "cift": "Çift tık", "sag": "Sağ tık"}
TIKLAMA_KODLARI = {v: k for k, v in TIKLAMA_ADLARI.items()}


class ButonAyarDiyalog(Diyalog):
    """Butona tıklama adımının tüm ayarları (+ resim önizleme)."""

    def __init__(self, kok, varsayilan_ad, guven, resim_yolu=None, ilk=None):
        super().__init__(kok, "Buton Ayarları")
        ilk = ilk or {}

        if resim_yolu and os.path.exists(resim_yolu):
            try:
                img = Image.open(resim_yolu)
                img.thumbnail((260, 70))
                self._foto = ImageTk.PhotoImage(img)
                cerceve = tk.Frame(self.govde, bg=KART_2, padx=6, pady=6)
                cerceve.pack(pady=(0, 4))
                tk.Label(cerceve, image=self._foto, bg=KART_2).pack()
            except Exception:
                pass

        self.etiket("Buton adı:")
        self.ad = giris_yap(self.govde, ilk.get("ad", varsayilan_ad))
        self.ad.pack(fill="x", ipady=5)
        self.ad.select_range(0, "end")
        self.ad.focus_set()

        self.etiket("Tıklama şekli:")
        self.tiklama = ttk.Combobox(self.govde, state="readonly",
                                    values=list(TIKLAMA_ADLARI.values()))
        self.tiklama.set(TIKLAMA_ADLARI.get(ilk.get("tiklama", "sol"), "Sol tık"))
        self.tiklama.pack(fill="x")

        satir = tk.Frame(self.govde, bg=KART)
        satir.pack(fill="x", pady=(8, 0))
        tk.Label(satir, text="En fazla bekle (sn):", bg=KART, fg=YAZI,
                 font=FONT).grid(row=0, column=0, sticky="w")
        self.sure = giris_yap(satir, ilk.get("zaman_asimi", 10), 6)
        self.sure.grid(row=0, column=1, padx=6)
        tk.Label(satir, text="Bulunamazsa:", bg=KART, fg=YAZI,
                 font=FONT).grid(row=1, column=0, sticky="w", pady=(6, 0))
        self.bulunamazsa = ttk.Combobox(satir, state="readonly", width=14,
                                        values=["Hata ver, dur", "Atla, devam et"])
        self.bulunamazsa.set("Atla, devam et" if ilk.get("bulunamazsa") == "atla"
                             else "Hata ver, dur")
        self.bulunamazsa.grid(row=1, column=1, padx=6, pady=(6, 0))

        self.etiket("Tanıma hassasiyeti:")
        self.guven = tk.Scale(self.govde, from_=0.5, to=0.99, resolution=0.01,
                              orient="horizontal", bg=KART, fg=YAZI,
                              highlightthickness=0, troughcolor=KART_2)
        self.guven.set(float(ilk.get("guven", guven)))
        self.guven.pack(fill="x")
        self.ipucu("Bulamıyorsa düşür, yanlış yere tıklıyorsa yükselt.")

        self.etiket("Tıklama noktasını kaydır (piksel, isteğe bağlı):")
        satir2 = tk.Frame(self.govde, bg=KART)
        satir2.pack(fill="x")
        tk.Label(satir2, text="Yatay:", bg=KART, fg=SOLUK, font=FONT_K).pack(side="left")
        self.kx = giris_yap(satir2, ilk.get("kaydir_x", 0), 5)
        self.kx.pack(side="left", padx=(4, 12))
        tk.Label(satir2, text="Dikey:", bg=KART, fg=SOLUK, font=FONT_K).pack(side="left")
        self.ky = giris_yap(satir2, ilk.get("kaydir_y", 0), 5)
        self.ky.pack(side="left", padx=4)
        self.ipucu("Örn. butonun 20px sağına tıklamak için Yatay = 20.")

        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        ad = self.ad.get().strip()
        if not ad:
            return None

        def tam(kutu, varsayilan=0):
            try:
                return int(float(kutu.get().replace(",", ".")))
            except ValueError:
                return varsayilan

        return {
            "ad": ad,
            "tiklama": TIKLAMA_KODLARI[self.tiklama.get()],
            "zaman_asimi": max(1, tam(self.sure, 10)),
            "bulunamazsa": "atla" if self.bulunamazsa.get().startswith("Atla") else "hata",
            "guven": float(self.guven.get()),
            "kaydir_x": tam(self.kx),
            "kaydir_y": tam(self.ky),
        }


class ButonBekleDiyalog(Diyalog):
    def __init__(self, kok, varsayilan_ad, ilk=None):
        super().__init__(kok, "Buton Bekleme")
        ilk = ilk or {}
        self.etiket("İsim:")
        self.ad = giris_yap(self.govde, ilk.get("ad", varsayilan_ad))
        self.ad.pack(fill="x", ipady=5)
        self.etiket("Ne beklensin?")
        self.mod = ttk.Combobox(self.govde, state="readonly",
                                values=["Görünene kadar bekle", "Kaybolana kadar bekle"])
        self.mod.set("Kaybolana kadar bekle" if ilk.get("mod") == "kaybolana"
                     else "Görünene kadar bekle")
        self.mod.pack(fill="x")
        self.etiket("En fazla kaç saniye beklensin?")
        self.sure = giris_yap(self.govde, ilk.get("zaman_asimi", 30), 8)
        self.sure.pack(anchor="w", ipady=4)
        self.ipucu("Örn: 'yükleniyor' simgesi kaybolana kadar bekle,\nsonra sonraki adıma geç.")
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        ad = self.ad.get().strip()
        if not ad:
            return None
        try:
            sure = max(1, float(self.sure.get().replace(",", ".")))
        except ValueError:
            sure = 30
        return {
            "ad": ad,
            "mod": "kaybolana" if self.mod.get().startswith("Kaybolana") else "gorunene",
            "zaman_asimi": sure,
        }


class KonumDiyalog(Diyalog):
    def __init__(self, kok, x, y, ilk=None):
        super().__init__(kok, "Konuma Tıkla")
        ilk = ilk or {}
        self.etiket("Tıklanacak nokta:")
        satir = tk.Frame(self.govde, bg=KART)
        satir.pack(fill="x")
        tk.Label(satir, text="X:", bg=KART, fg=SOLUK, font=FONT).pack(side="left")
        self.x = giris_yap(satir, ilk.get("x", x), 7)
        self.x.pack(side="left", padx=(4, 12))
        tk.Label(satir, text="Y:", bg=KART, fg=SOLUK, font=FONT).pack(side="left")
        self.y = giris_yap(satir, ilk.get("y", y), 7)
        self.y.pack(side="left", padx=4)
        self.etiket("Tıklama şekli:")
        self.tiklama = ttk.Combobox(self.govde, state="readonly",
                                    values=list(TIKLAMA_ADLARI.values()))
        self.tiklama.set(TIKLAMA_ADLARI.get(ilk.get("tiklama", "sol"), "Sol tık"))
        self.tiklama.pack(fill="x")
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        try:
            return {
                "x": int(self.x.get()),
                "y": int(self.y.get()),
                "tiklama": TIKLAMA_KODLARI[self.tiklama.get()],
            }
        except ValueError:
            return None


class BekleDiyalog(Diyalog):
    def __init__(self, kok, ilk=None):
        super().__init__(kok, "Bekleme")
        self.etiket("Kaç saniye beklensin?")
        self.sure = giris_yap(self.govde, (ilk or {}).get("sure", 2))
        self.sure.pack(fill="x", ipady=5)
        self.sure.select_range(0, "end")
        self.sure.focus_set()
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        try:
            deger = float(self.sure.get().replace(",", "."))
            return {"sure": deger} if deger > 0 else None
        except ValueError:
            return None


class RastgeleBekleDiyalog(Diyalog):
    def __init__(self, kok, ilk=None):
        super().__init__(kok, "Rastgele Bekleme")
        ilk = ilk or {}
        self.etiket("İki değer arasında rastgele beklenir (saniye):")
        satir = tk.Frame(self.govde, bg=KART)
        satir.pack(fill="x")
        tk.Label(satir, text="En az:", bg=KART, fg=SOLUK, font=FONT).pack(side="left")
        self.az = giris_yap(satir, ilk.get("en_az", 1), 7)
        self.az.pack(side="left", padx=(4, 12))
        tk.Label(satir, text="En çok:", bg=KART, fg=SOLUK, font=FONT).pack(side="left")
        self.cok = giris_yap(satir, ilk.get("en_cok", 3), 7)
        self.cok.pack(side="left", padx=4)
        self.ipucu("İnsan gibi görünmek ve sunucuları yormamak için kullanışlıdır.")
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        try:
            az = float(self.az.get().replace(",", "."))
            cok = float(self.cok.get().replace(",", "."))
            if az <= 0 or cok < az:
                return None
            return {"en_az": az, "en_cok": cok}
        except ValueError:
            return None


class YaziDiyalog(Diyalog):
    def __init__(self, kok, ilk=None):
        super().__init__(kok, "Yazı Yaz")
        self.etiket("Bot ne yazsın? (imlecin olduğu yere yazar)")
        self.metin = giris_yap(self.govde, (ilk or {}).get("metin", ""), 42)
        self.metin.pack(fill="x", ipady=5)
        self.metin.focus_set()
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        metin = self.metin.get()
        return {"metin": metin} if metin else None


class TusDiyalog(Diyalog):
    TUSLAR = ["enter", "tab", "esc", "space", "backspace", "delete",
              "up", "down", "left", "right", "home", "end",
              "pageup", "pagedown"] + [f"f{i}" for i in range(1, 13)]

    def __init__(self, kok, ilk=None):
        super().__init__(kok, "Tuşa Bas")
        ilk = ilk or {}
        self.etiket("Hangi tuş?")
        self.tus = ttk.Combobox(self.govde, state="readonly", values=self.TUSLAR)
        self.tus.set(ilk.get("tus", "enter"))
        self.tus.pack(fill="x")
        self.etiket("Kaç kez basılsın?")
        self.kac = giris_yap(self.govde, ilk.get("tekrar", 1), 6)
        self.kac.pack(anchor="w", ipady=4)
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        if not self.tus.get():
            return None
        try:
            kac = max(1, int(self.kac.get()))
        except ValueError:
            kac = 1
        return {"tus": self.tus.get(), "tekrar": kac}


class KisayolDiyalog(Diyalog):
    def __init__(self, kok, ilk=None):
        super().__init__(kok, "Kısayol Bas")
        self.etiket("Tuş kombinasyonu ( + ile ayır):")
        varsayilan = "+".join((ilk or {}).get("tuslar", ["ctrl", "c"]))
        self.tuslar = giris_yap(self.govde, varsayilan, 30)
        self.tuslar.pack(fill="x", ipady=5)
        self.tuslar.focus_set()
        self.ipucu("Örnekler:  ctrl+c   ctrl+shift+s   alt+tab   ctrl+a\n"
                   "Kullanılabilir: ctrl, alt, shift, win, harfler, enter, tab...")
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        parcalar = [p.strip().lower() for p in self.tuslar.get().split("+") if p.strip()]
        return {"tuslar": parcalar} if parcalar else None


class KaydirDiyalog(Diyalog):
    def __init__(self, kok, ilk=None):
        super().__init__(kok, "Tekerlek Kaydır")
        ilk = ilk or {}
        self.etiket("Yön:")
        self.yon = ttk.Combobox(self.govde, state="readonly",
                                values=["Aşağı", "Yukarı"])
        self.yon.set("Yukarı" if ilk.get("yon") == "yukari" else "Aşağı")
        self.yon.pack(fill="x")
        self.etiket("Kaç çentik? (tekerlek çevirme miktarı)")
        self.miktar = giris_yap(self.govde, ilk.get("miktar", 3), 6)
        self.miktar.pack(anchor="w", ipady=4)
        self.onay_satiri("Tamam")
        self.wait_window()

    def topla(self):
        try:
            miktar = max(1, int(self.miktar.get()))
        except ValueError:
            return None
        return {"yon": "yukari" if self.yon.get() == "Yukarı" else "asagi",
                "miktar": miktar}


# ---------------------------------------------------------- ayarlar paneli
class AyarlarDiyalog(Diyalog):
    KISAYOLLAR = ["f2", "f3", "f4", "f6", "f7", "f8", "f9", "f10", "f11", "f12", "esc"]

    def __init__(self, kok, ayarlar):
        super().__init__(kok, "Ayarlar")
        a = ayarlar

        self.etiket("Genel tanıma hassasiyeti:")
        self.guven = tk.Scale(self.govde, from_=0.5, to=0.99, resolution=0.01,
                              orient="horizontal", bg=KART, fg=YAZI,
                              highlightthickness=0, troughcolor=KART_2)
        self.guven.set(a["guven"])
        self.guven.pack(fill="x")

        self.etiket("Fare hedefe kaç saniyede gitsin? (0 = ışınlan)")
        self.fare = giris_yap(self.govde, a["fare_hizi"], 8)
        self.fare.pack(anchor="w", ipady=4)

        satir = tk.Frame(self.govde, bg=KART)
        satir.pack(fill="x", pady=(8, 0))
        tk.Label(satir, text="Adımlar arası bekleme (sn):", bg=KART, fg=YAZI,
                 font=FONT).grid(row=0, column=0, sticky="w")
        self.adim_arasi = giris_yap(satir, a["adim_arasi"], 7)
        self.adim_arasi.grid(row=0, column=1, padx=6)
        tk.Label(satir, text="Turlar arası bekleme (sn):", bg=KART, fg=YAZI,
                 font=FONT).grid(row=1, column=0, sticky="w", pady=(6, 0))
        self.tur_arasi = giris_yap(satir, a["tur_arasi"], 7)
        self.tur_arasi.grid(row=1, column=1, padx=6, pady=(6, 0))
        tk.Label(satir, text="Başlarken geri sayım (sn):", bg=KART, fg=YAZI,
                 font=FONT).grid(row=2, column=0, sticky="w", pady=(6, 0))
        self.geri_sayim = giris_yap(satir, a["geri_sayim"], 7)
        self.geri_sayim.grid(row=2, column=1, padx=6, pady=(6, 0))

        self.insansi = tk.BooleanVar(value=a["insansi"])
        tk.Checkbutton(
            self.govde, text="İnsansı mod (küçük rastgele sapma ve gecikmeler)",
            variable=self.insansi, bg=KART, fg=YAZI, selectcolor=KART_2,
            activebackground=KART, activeforeground=YAZI, font=FONT,
        ).pack(anchor="w", pady=(10, 0))

        self.etiket("Kısayol tuşları:")
        satir2 = tk.Frame(self.govde, bg=KART)
        satir2.pack(fill="x")
        tk.Label(satir2, text="Başlat:", bg=KART, fg=SOLUK, font=FONT).pack(side="left")
        self.baslat = ttk.Combobox(satir2, state="readonly", width=6,
                                   values=self.KISAYOLLAR)
        self.baslat.set(a["baslat_tusu"])
        self.baslat.pack(side="left", padx=(4, 14))
        tk.Label(satir2, text="Durdur:", bg=KART, fg=SOLUK, font=FONT).pack(side="left")
        self.durdur = ttk.Combobox(satir2, state="readonly", width=6,
                                   values=self.KISAYOLLAR)
        self.durdur.set(a["durdur_tusu"])
        self.durdur.pack(side="left", padx=4)

        self.onay_satiri("Kaydet")
        self.wait_window()

    def topla(self):
        def sayi(kutu, varsayilan):
            try:
                return max(0.0, float(kutu.get().replace(",", ".")))
            except ValueError:
                return varsayilan

        if self.baslat.get() == self.durdur.get():
            messagebox.showwarning("Uyarı", "Başlat ve Durdur tuşu aynı olamaz.",
                                   parent=self)
            return None
        return {
            "guven": float(self.guven.get()),
            "fare_hizi": sayi(self.fare, 0.2),
            "adim_arasi": sayi(self.adim_arasi, 0.05),
            "tur_arasi": sayi(self.tur_arasi, 0.0),
            "geri_sayim": int(sayi(self.geri_sayim, 3)),
            "insansi": bool(self.insansi.get()),
            "baslat_tusu": self.baslat.get(),
            "durdur_tusu": self.durdur.get(),
        }


# ------------------------------------------------------------- ana pencere
class ButonBotu:
    def __init__(self, kok):
        self.kok = kok
        kok.title("Buton Botu PRO")
        kok.geometry("520x780")
        kok.minsize(480, 640)
        kok.configure(bg=ARKA)

        self.ayarlar = ayarlari_yukle()
        self.adimlar = []
        self.calistirici = None
        self.mesgul = False
        self._yakalama_modu = "tikla"   # "tikla" | "bekle"
        self._duzenlenen = None          # düzenlenen adımın sırası

        self._kur()
        self._son_tarifi_yukle()
        self._global_kisayollar()
        kok.protocol("WM_DELETE_WINDOW", self._kapat)

    # ------------------------------------------------------------- arayüz
    def _kur(self):
        ust = tk.Frame(self.kok, bg=ARKA)
        ust.pack(fill="x", padx=18, pady=(14, 6))
        sol = tk.Frame(ust, bg=ARKA)
        sol.pack(side="left")
        tk.Label(sol, text="Buton Botu PRO", bg=ARKA, fg=YAZI,
                 font=("Segoe UI", 16, "bold")).pack(anchor="w")
        tk.Label(sol, text="Tarifi kur, bot butonları ekranda kendisi bulup tıklasın.",
                 bg=ARKA, fg=SOLUK, font=FONT_K).pack(anchor="w")
        buton_yap(ust, "⚙ Ayarlar", KART_2, self.ayarlari_ac).pack(side="right")

        # ---- adım ekleme
        kart_ekle = kart_yap(self.kok, "ADIM EKLE")
        kart_ekle.pack(fill="x", padx=18, pady=5)
        satir = tk.Frame(kart_ekle, bg=KART)
        satir.pack(fill="x", padx=12, pady=(2, 12))
        buton_yap(satir, "📷 Butona Tıkla", MAVI, self.buton_adimi).pack(
            side="left", expand=True, fill="x", padx=2)

        self.diger_menu = tk.Menu(
            self.kok, tearoff=0, bg=KART_2, fg=YAZI, font=FONT,
            activebackground=MAVI, activeforeground="white", bd=0,
        )
        for metin, komut in (
            ("🎯  Konuma tıkla (sabit nokta)", self.konum_adimi),
            ("👁  Buton görünene/kaybolana kadar bekle", self.buton_bekle_adimi),
            ("⏱  Bekle", self.bekle_adimi),
            ("🎲  Rastgele bekle", self.rastgele_adimi),
            ("⌨  Yazı yaz", self.yazi_adimi),
            ("↵  Tuşa bas", self.tus_adimi),
            ("⌃  Kısayol bas (ctrl+c gibi)", self.kisayol_adimi),
            ("🖱  Tekerlek kaydır", self.kaydir_adimi),
            ("🔔  Bip sesi çal", self.ses_adimi),
        ):
            self.diger_menu.add_command(label=metin, command=komut)

        diger = buton_yap(satir, "➕ Diğer Adımlar ▾", KART_2, None)
        diger.config(command=lambda: self.diger_menu.tk_popup(
            diger.winfo_rootx(), diger.winfo_rooty() + diger.winfo_height()))
        diger.pack(side="left", expand=True, fill="x", padx=2)

        # ---- tarif listesi
        kart_liste = kart_yap(self.kok, "TARİF  (bot bunları sırayla yapar — çift tık: düzenle)")
        kart_liste.pack(fill="both", expand=True, padx=18, pady=5)

        orta = tk.Frame(kart_liste, bg=KART)
        orta.pack(fill="both", expand=True, padx=12, pady=(2, 6))
        self.liste = tk.Listbox(
            orta, bg=KART_2, fg=YAZI, font=FONT,
            selectbackground=MAVI, selectforeground="white",
            relief="flat", highlightthickness=0, activestyle="none",
        )
        self.liste.pack(side="left", fill="both", expand=True)
        self.liste.bind("<Double-Button-1>", lambda e: self.duzenle())
        kaydir = tk.Scrollbar(orta, command=self.liste.yview)
        kaydir.pack(side="right", fill="y")
        self.liste.config(yscrollcommand=kaydir.set)

        arac = tk.Frame(kart_liste, bg=KART)
        arac.pack(fill="x", padx=12, pady=(0, 12))
        for metin, komut in (
            ("↑", self.yukari), ("↓", self.asagi),
            ("✎", self.duzenle), ("⧉", self.kopyala), ("✕", self.sil),
            ("▶ Test", self.adim_test),
        ):
            buton_yap(arac, metin, KART_2, komut).pack(side="left", padx=2)
        buton_yap(arac, "📂", KART_2, self.tarif_ac).pack(side="right", padx=2)
        buton_yap(arac, "💾", KART_2, self.tarif_kaydet_tikla).pack(side="right", padx=2)
        buton_yap(arac, "🗑 Tümü", KART_2, self.tumunu_sil).pack(side="right", padx=2)

        # ---- çalıştırma
        kart_calistir = kart_yap(self.kok, "ÇALIŞTIR")
        kart_calistir.pack(fill="x", padx=18, pady=5)

        ayar = tk.Frame(kart_calistir, bg=KART)
        ayar.pack(fill="x", padx=12)
        tk.Label(ayar, text="Tekrar sayısı (0 = sonsuz):", bg=KART, fg=YAZI,
                 font=FONT).pack(side="left")
        self.tekrar = giris_yap(ayar, "1", 7)
        self.tekrar.pack(side="left", padx=8, ipady=3)

        calistir_satir = tk.Frame(kart_calistir, bg=KART)
        calistir_satir.pack(fill="x", padx=12, pady=(8, 12))
        self.baslat_buton = buton_yap(calistir_satir, "▶  BAŞLAT", YESIL,
                                      self.calistir, buyuk=True)
        self.baslat_buton.pack(side="left", fill="x", expand=True, padx=(0, 4))
        self.durdur_buton = buton_yap(calistir_satir, "⏹  Durdur", KIRMIZI,
                                      self.durdur, buyuk=True)
        self.durdur_buton.pack(side="left", fill="x", expand=True, padx=(4, 0))
        self.durdur_buton.config(state="disabled")

        # ---- günlük
        kart_log = kart_yap(self.kok, "GÜNLÜK")
        kart_log.pack(fill="x", padx=18, pady=(5, 6))
        self.log_kutusu = tk.Text(
            kart_log, height=6, bg=KART_2, fg=SOLUK, font=("Consolas", 9),
            relief="flat", highlightthickness=0, state="disabled", wrap="word",
        )
        self.log_kutusu.pack(fill="x", padx=12, pady=(2, 12))

        # ---- durum çubuğu
        self.durum_etiket = tk.Label(
            self.kok, text=self._hazir_metni(),
            bg=KART, fg=SOLUK, font=FONT_K, anchor="w", padx=12, pady=7,
        )
        self.durum_etiket.pack(side="bottom", fill="x")

    def _hazir_metni(self):
        return (f"Hazır  •  Başlat: {self.ayarlar['baslat_tusu'].upper()}"
                f"  •  Durdur: {self.ayarlar['durdur_tusu'].upper()}")

    # ------------------------------------------------------------ yardımcı
    def durum(self, metin, renk=SOLUK):
        self.durum_etiket.config(text=metin, fg=renk)

    def log(self, metin):
        self.log_kutusu.config(state="normal")
        self.log_kutusu.insert("end", f"[{time.strftime('%H:%M:%S')}] {metin}\n")
        if int(self.log_kutusu.index("end-1c").split(".")[0]) > 400:
            self.log_kutusu.delete("1.0", "2.0")
        self.log_kutusu.see("end")
        self.log_kutusu.config(state="disabled")

    def listeyi_ciz(self):
        self.liste.delete(0, "end")
        for i, adim in enumerate(self.adimlar, 1):
            self.liste.insert("end", f"  {i}.  {self._adim_metni(adim)}")

    @staticmethod
    def _adim_metni(adim):
        tip = adim["tip"]
        if tip == "butona_tikla":
            ad = os.path.splitext(os.path.basename(adim["resim"]))[0]
            sekil = {"sol": "tıkla", "cift": "çift tıkla",
                     "sag": "sağ tıkla"}[adim.get("tiklama", "sol")]
            ek = "  (yoksa atla)" if adim.get("bulunamazsa") == "atla" else ""
            return f"📷  '{ad}' butonunu bul, {sekil}{ek}"
        if tip == "buton_bekle":
            ad = os.path.splitext(os.path.basename(adim["resim"]))[0]
            ne = "kaybolana" if adim.get("mod") == "kaybolana" else "görünene"
            return f"👁  '{ad}' {ne} kadar bekle"
        if tip == "tikla_koordinat":
            sekil = {"sol": "tıkla", "cift": "çift tıkla",
                     "sag": "sağ tıkla"}[adim.get("tiklama", "sol")]
            return f"🎯  ({adim['x']}, {adim['y']}) noktasına {sekil}"
        if tip == "bekle":
            return f"⏱  {adim['sure']} saniye bekle"
        if tip == "rastgele_bekle":
            return f"🎲  {adim['en_az']}–{adim['en_cok']} sn rastgele bekle"
        if tip == "yazi":
            kisa = adim["metin"][:26] + ("…" if len(adim["metin"]) > 26 else "")
            return f"⌨  Yaz: \"{kisa}\""
        if tip == "tus":
            kac = int(adim.get("tekrar", 1))
            ek = f" ({kac} kez)" if kac > 1 else ""
            return f"↵  '{adim['tus']}' tuşuna bas{ek}"
        if tip == "kisayol":
            return f"⌃  Kısayol: {'+'.join(adim['tuslar'])}"
        if tip == "kaydir":
            yon = "aşağı" if adim.get("yon") == "asagi" else "yukarı"
            return f"🖱  Tekerleği {yon} kaydır ({adim['miktar']})"
        if tip == "ses":
            return "🔔  Bip sesi çal"
        return "?"

    def _secili(self):
        secim = self.liste.curselection()
        return secim[0] if secim else None

    def _adim_ekle(self, adim):
        if self._duzenlenen is not None:
            self.adimlar[self._duzenlenen] = adim
            self._duzenlenen = None
        else:
            self.adimlar.append(adim)
        self.listeyi_ciz()

    # ---------------------------------------------------- buton yakalama
    def buton_adimi(self):
        if self.mesgul:
            return
        self._yakalama_modu = "tikla"
        self._duzenlenen = None
        self._yakalamayi_baslat()

    def buton_bekle_adimi(self):
        if self.mesgul:
            return
        self._yakalama_modu = "bekle"
        self._duzenlenen = None
        self._yakalamayi_baslat()

    def _yakalamayi_baslat(self):
        self.durum("Butonun olduğu pencereyi öne getir — 3 sn sonra ekran fotoğrafı çekilecek!", TURUNCU)
        self.kok.withdraw()
        self.kok.after(3000, self._foto_cek)

    def _foto_cek(self):
        resim = pyautogui.screenshot()
        BolgeSecici(self.kok, resim, self._secim_bitti)

    def _yeni_buton_adi(self):
        os.makedirs(BUTON_KLASORU, exist_ok=True)
        sayi = 1
        while os.path.exists(os.path.join(BUTON_KLASORU, f"buton{sayi}.png")):
            sayi += 1
        return f"buton{sayi}"

    def _secim_bitti(self, kirpik):
        self.kok.deiconify()
        if kirpik is None:
            self.durum("Seçim iptal edildi.")
            return

        varsayilan = self._yeni_buton_adi()
        gecici_yol = os.path.join(BUTON_KLASORU, f"{varsayilan}.png")
        kirpik.save(gecici_yol)

        if self._yakalama_modu == "bekle":
            ayar = ButonBekleDiyalog(self.kok, varsayilan).sonuc
        else:
            ayar = ButonAyarDiyalog(self.kok, varsayilan, self.ayarlar["guven"],
                                    resim_yolu=gecici_yol).sonuc
        if not ayar:
            try:
                os.remove(gecici_yol)
            except OSError:
                pass
            self.durum("Vazgeçildi.")
            return

        yol = os.path.join(BUTON_KLASORU, f"{ayar['ad']}.png")
        if yol != gecici_yol:
            try:
                if os.path.exists(yol):
                    os.remove(yol)
                os.rename(gecici_yol, yol)
            except OSError:
                yol = gecici_yol

        if self._yakalama_modu == "bekle":
            self._adim_ekle({
                "tip": "buton_bekle", "resim": yol,
                "mod": ayar["mod"], "zaman_asimi": ayar["zaman_asimi"],
            })
        else:
            self._adim_ekle({
                "tip": "butona_tikla", "resim": yol,
                "tiklama": ayar["tiklama"], "zaman_asimi": ayar["zaman_asimi"],
                "bulunamazsa": ayar["bulunamazsa"], "guven": ayar["guven"],
                "kaydir_x": ayar["kaydir_x"], "kaydir_y": ayar["kaydir_y"],
            })
        self.durum(f"'{ayar['ad']}' tarife eklendi.", YESIL)
        self.log(f"Adım eklendi: {ayar['ad']}")

    # ------------------------------------------------- diğer adım türleri
    def konum_adimi(self):
        self.durum("Fareyi tıklanacak noktaya götür — 3 sn sonra konum alınacak!", TURUNCU)
        self.kok.after(3000, self._konum_al)

    def _konum_al(self):
        x, y = pyautogui.position()
        sonuc = KonumDiyalog(self.kok, x, y).sonuc
        if sonuc:
            self._adim_ekle({"tip": "tikla_koordinat", **sonuc})
            self.durum("Konum adımı eklendi.", YESIL)
        else:
            self.durum("Vazgeçildi.")

    def bekle_adimi(self):
        sonuc = BekleDiyalog(self.kok).sonuc
        if sonuc:
            self._adim_ekle({"tip": "bekle", **sonuc})

    def rastgele_adimi(self):
        sonuc = RastgeleBekleDiyalog(self.kok).sonuc
        if sonuc:
            self._adim_ekle({"tip": "rastgele_bekle", **sonuc})

    def yazi_adimi(self):
        sonuc = YaziDiyalog(self.kok).sonuc
        if sonuc:
            self._adim_ekle({"tip": "yazi", **sonuc})

    def tus_adimi(self):
        sonuc = TusDiyalog(self.kok).sonuc
        if sonuc:
            self._adim_ekle({"tip": "tus", **sonuc})

    def kisayol_adimi(self):
        sonuc = KisayolDiyalog(self.kok).sonuc
        if sonuc:
            self._adim_ekle({"tip": "kisayol", **sonuc})

    def kaydir_adimi(self):
        sonuc = KaydirDiyalog(self.kok).sonuc
        if sonuc:
            self._adim_ekle({"tip": "kaydir", **sonuc})

    def ses_adimi(self):
        self._adim_ekle({"tip": "ses"})

    # ------------------------------------------------------ liste işlemleri
    def duzenle(self):
        i = self._secili()
        if i is None:
            self.durum("Düzenlemek için listeden bir adım seç.", TURUNCU)
            return
        adim = self.adimlar[i]
        tip = adim["tip"]
        self._duzenlenen = i

        if tip == "butona_tikla":
            ad = os.path.splitext(os.path.basename(adim["resim"]))[0]
            ilk = {**adim, "ad": ad}
            sonuc = ButonAyarDiyalog(self.kok, ad, self.ayarlar["guven"],
                                     resim_yolu=adim["resim"], ilk=ilk).sonuc
            if sonuc:
                yol = adim["resim"]
                if sonuc["ad"] != ad:
                    yeni_yol = os.path.join(BUTON_KLASORU, f"{sonuc['ad']}.png")
                    try:
                        os.rename(yol, yeni_yol)
                        yol = yeni_yol
                    except OSError:
                        pass
                self._adim_ekle({
                    "tip": "butona_tikla", "resim": yol,
                    "tiklama": sonuc["tiklama"], "zaman_asimi": sonuc["zaman_asimi"],
                    "bulunamazsa": sonuc["bulunamazsa"], "guven": sonuc["guven"],
                    "kaydir_x": sonuc["kaydir_x"], "kaydir_y": sonuc["kaydir_y"],
                })
                return
        elif tip == "buton_bekle":
            ad = os.path.splitext(os.path.basename(adim["resim"]))[0]
            sonuc = ButonBekleDiyalog(self.kok, ad, ilk={**adim, "ad": ad}).sonuc
            if sonuc:
                self._adim_ekle({"tip": "buton_bekle", "resim": adim["resim"],
                                 "mod": sonuc["mod"],
                                 "zaman_asimi": sonuc["zaman_asimi"]})
                return
        elif tip == "tikla_koordinat":
            sonuc = KonumDiyalog(self.kok, adim["x"], adim["y"], ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "tikla_koordinat", **sonuc})
                return
        elif tip == "bekle":
            sonuc = BekleDiyalog(self.kok, ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "bekle", **sonuc})
                return
        elif tip == "rastgele_bekle":
            sonuc = RastgeleBekleDiyalog(self.kok, ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "rastgele_bekle", **sonuc})
                return
        elif tip == "yazi":
            sonuc = YaziDiyalog(self.kok, ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "yazi", **sonuc})
                return
        elif tip == "tus":
            sonuc = TusDiyalog(self.kok, ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "tus", **sonuc})
                return
        elif tip == "kisayol":
            sonuc = KisayolDiyalog(self.kok, ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "kisayol", **sonuc})
                return
        elif tip == "kaydir":
            sonuc = KaydirDiyalog(self.kok, ilk=adim).sonuc
            if sonuc:
                self._adim_ekle({"tip": "kaydir", **sonuc})
                return
        self._duzenlenen = None

    def kopyala(self):
        i = self._secili()
        if i is None:
            return
        self.adimlar.insert(i + 1, dict(self.adimlar[i]))
        self.listeyi_ciz()
        self.liste.selection_set(i + 1)

    def sil(self):
        i = self._secili()
        if i is None:
            self.durum("Silmek için listeden bir adım seç.", TURUNCU)
            return
        del self.adimlar[i]
        self.listeyi_ciz()

    def tumunu_sil(self):
        if self.adimlar and messagebox.askyesno("Temizle", "Tüm adımlar silinsin mi?"):
            self.adimlar = []
            self.listeyi_ciz()

    def yukari(self):
        i = self._secili()
        if i in (None, 0):
            return
        self.adimlar[i - 1], self.adimlar[i] = self.adimlar[i], self.adimlar[i - 1]
        self.listeyi_ciz()
        self.liste.selection_set(i - 1)

    def asagi(self):
        i = self._secili()
        if i is None or i >= len(self.adimlar) - 1:
            return
        self.adimlar[i + 1], self.adimlar[i] = self.adimlar[i], self.adimlar[i + 1]
        self.listeyi_ciz()
        self.liste.selection_set(i + 1)

    # ---------------------------------------------------------- kaydet/aç
    def tarif_kaydet_tikla(self):
        if not self.adimlar:
            self.durum("Kaydedilecek adım yok.", TURUNCU)
            return
        os.makedirs(TARIF_KLASORU, exist_ok=True)
        yol = filedialog.asksaveasfilename(
            initialdir=TARIF_KLASORU, defaultextension=".json",
            filetypes=[("Tarif", "*.json")], title="Tarifi kaydet",
        )
        if yol:
            tarif_kaydet(self.adimlar, yol)
            self.durum(f"Tarif kaydedildi: {os.path.basename(yol)}", YESIL)

    def tarif_ac(self):
        os.makedirs(TARIF_KLASORU, exist_ok=True)
        yol = filedialog.askopenfilename(
            initialdir=TARIF_KLASORU, filetypes=[("Tarif", "*.json")],
            title="Tarif aç",
        )
        if yol:
            try:
                self.adimlar = tarif_yukle(yol)
            except Exception as hata:
                messagebox.showerror("Hata", f"Tarif açılamadı: {hata}")
                return
            self.listeyi_ciz()
            self.durum(f"Tarif yüklendi: {os.path.basename(yol)}", YESIL)

    def _son_tarifi_yukle(self):
        try:
            self.adimlar = tarif_yukle(SON_TARIF)
            self.listeyi_ciz()
            self.log("Son çalışmadaki tarif geri yüklendi.")
        except Exception:
            pass

    def _kapat(self):
        try:
            if self.adimlar:
                tarif_kaydet(self.adimlar, SON_TARIF)
            elif os.path.exists(SON_TARIF):
                os.remove(SON_TARIF)
        except Exception:
            pass
        self.kok.destroy()

    # ------------------------------------------------------------- ayarlar
    def ayarlari_ac(self):
        sonuc = AyarlarDiyalog(self.kok, self.ayarlar).sonuc
        if sonuc:
            self.ayarlar.update(sonuc)
            ayarlari_kaydet(self.ayarlar)
            self.durum(self._hazir_metni())
            self.log("Ayarlar kaydedildi.")

    # -------------------------------------------------- global kısayollar
    def _global_kisayollar(self):
        if not pynput_klavye:
            return

        def basildi(key):
            if key == ozel_tus(self.ayarlar["baslat_tusu"]) and not self.mesgul:
                self.kok.after(0, self.calistir)
            elif key == ozel_tus(self.ayarlar["durdur_tusu"]) and self.mesgul:
                if self.calistirici:
                    self.calistirici.durdur()

        dinleyici = pynput_klavye.Listener(on_press=basildi)
        dinleyici.daemon = True
        dinleyici.start()

    # ------------------------------------------------------------ çalıştır
    def calistir(self):
        if self.mesgul:
            return
        if not self.adimlar:
            self.durum("Önce tarife adım ekle (📷 Butona Tıkla ile başla).", TURUNCU)
            return
        try:
            tekrar = max(0, int(self.tekrar.get()))
        except ValueError:
            tekrar = 1
        self._baslat(list(self.adimlar), tekrar)

    def adim_test(self):
        """Sadece seçili adımı bir kez dener."""
        if self.mesgul:
            return
        i = self._secili()
        if i is None:
            self.durum("Test için listeden bir adım seç.", TURUNCU)
            return
        self.log(f"Test: {self._adim_metni(self.adimlar[i])}")
        self._baslat([self.adimlar[i]], 1)

    def _baslat(self, adimlar, tekrar):
        self.mesgul = True
        self.baslat_buton.config(state="disabled")
        self.durdur_buton.config(state="normal")
        sayim = int(self.ayarlar["geri_sayim"])
        self.durum(f"{sayim} sn içinde başlıyor — hedef pencereyi öne getir! "
                   f"(Durdur: {self.ayarlar['durdur_tusu'].upper()})", TURUNCU)
        self.log(f"Başlatılıyor... ({len(adimlar)} adım, "
                 f"{'sonsuz' if tekrar == 0 else str(tekrar)} tekrar)")
        self.kok.iconify()

        self.calistirici = TarifCalistirici(adimlar, ayarlar=self.ayarlar,
                                            durum_yaz=self._is_durumu)
        threading.Thread(target=self._calis, args=(tekrar, sayim),
                         daemon=True).start()

    def _calis(self, tekrar, sayim):
        if not self.calistirici.durduruldu.wait(timeout=sayim):
            basarili, mesaj = self.calistirici.calistir(tekrar)
        else:
            basarili, mesaj = False, "İptal edildi."
        self.kok.after(0, lambda: self._bitti(basarili, mesaj))

    def _is_durumu(self, mesaj):
        self.kok.after(0, lambda: (self.durum(mesaj, YAZI), self.log(mesaj)))

    def _bitti(self, basarili, mesaj):
        self.kok.deiconify()
        self.mesgul = False
        self.baslat_buton.config(state="normal")
        self.durdur_buton.config(state="disabled")
        self.durum(mesaj, YESIL if basarili else KIRMIZI)
        self.log(mesaj)
        if not basarili and "bulunamadı" in mesaj:
            messagebox.showwarning("Buton bulunamadı", mesaj)

    def durdur(self):
        if self.calistirici:
            self.calistirici.durdur()
        self.durum("Durduruluyor...", TURUNCU)


def main():
    kok = tk.Tk()
    ButonBotu(kok)
    kok.mainloop()


if __name__ == "__main__":
    main()
