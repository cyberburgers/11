# -*- coding: utf-8 -*-
"""
Buton Botu — Modern arayüz

Sen tarifi kurarsın:  "şu butona tıkla → 2 sn bekle → şunu yaz → Enter"
Bot butonları EKRANDA GÖRÜNTÜSÜNDEN TANIR ve tarifi sırasıyla uygular.

Çalıştırmak için:  python arayuz.py
Oynatma sırasında durdurmak: ESC (veya fareyi sol üst köşeye fırlat)
"""

import os
import sys
import threading
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
    TARIF_KLASORU,
    BUTON_KLASORU,
)

# ------------------------------------------------------------------ tema
ARKA = "#14161f"        # pencere arka planı
KART = "#1e2130"        # kart/kutu arka planı
KART_2 = "#262a3d"      # liste arka planı
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
    """Düz, modern görünümlü buton."""
    return tk.Button(
        ana, text=metin, command=komut,
        bg=renk, fg="white", activebackground=renk, activeforeground="white",
        relief="flat", bd=0, cursor="hand2",
        font=FONT_B if buyuk else FONT,
        padx=14, pady=8 if buyuk else 5,
    )


def kart_yap(ana, baslik):
    """Başlıklı koyu kart."""
    dis = tk.Frame(ana, bg=KART)
    tk.Label(dis, text=baslik, bg=KART, fg=SOLUK, font=("Segoe UI", 9, "bold"),
             anchor="w").pack(fill="x", padx=14, pady=(10, 2))
    return dis


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
                                    fill="#14161f", outline="")
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


# --------------------------------------------------------- küçük diyaloglar
class Diyalog(tk.Toplevel):
    """Koyu temalı basit modal pencere tabanı."""

    def __init__(self, kok, baslik, genislik=340):
        super().__init__(kok)
        self.title(baslik)
        self.configure(bg=KART)
        self.resizable(False, False)
        self.transient(kok)
        self.grab_set()
        self.sonuc = None
        self.govde = tk.Frame(self, bg=KART, padx=18, pady=14)
        self.govde.pack(fill="both", expand=True)
        # ekranın ortasına yaklaşık yerleştir
        self.geometry(f"+{kok.winfo_rootx() + 40}+{kok.winfo_rooty() + 120}")

    def etiket(self, metin):
        tk.Label(self.govde, text=metin, bg=KART, fg=YAZI, font=FONT,
                 anchor="w").pack(fill="x", pady=(8, 2))

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

    def topla(self):  # alt sınıflar doldurur
        return None


class ButonAyarDiyalog(Diyalog):
    def __init__(self, kok, varsayilan_ad):
        super().__init__(kok, "Buton Ayarları")
        self.etiket("Butona bir isim ver:")
        self.ad = tk.Entry(self.govde, font=FONT, bg=KART_2, fg=YAZI,
                           insertbackground=YAZI, relief="flat")
        self.ad.pack(fill="x", ipady=5)
        self.ad.insert(0, varsayilan_ad)
        self.ad.select_range(0, "end")
        self.ad.focus_set()

        self.etiket("Tıklama şekli:")
        self.tiklama = ttk.Combobox(self.govde, state="readonly",
                                    values=["Sol tık", "Çift tık", "Sağ tık"])
        self.tiklama.current(0)
        self.tiklama.pack(fill="x")

        self.etiket("Buton ekranda yoksa en fazla kaç saniye beklensin?")
        self.sure = tk.Spinbox(self.govde, from_=1, to=600, width=6, font=FONT,
                               bg=KART_2, fg=YAZI, relief="flat")
        self.sure.delete(0, "end")
        self.sure.insert(0, "10")
        self.sure.pack(anchor="w")

        self.onay_satiri("Ekle")
        self.wait_window()

    def topla(self):
        ad = self.ad.get().strip()
        if not ad:
            return None
        tiklama = {"Sol tık": "sol", "Çift tık": "cift", "Sağ tık": "sag"}[self.tiklama.get()]
        try:
            sure = max(1, int(self.sure.get()))
        except ValueError:
            sure = 10
        return {"ad": ad, "tiklama": tiklama, "zaman_asimi": sure}


class BekleDiyalog(Diyalog):
    def __init__(self, kok):
        super().__init__(kok, "Bekleme Ekle")
        self.etiket("Kaç saniye beklensin?")
        self.sure = tk.Entry(self.govde, font=FONT, bg=KART_2, fg=YAZI,
                             insertbackground=YAZI, relief="flat")
        self.sure.pack(fill="x", ipady=5)
        self.sure.insert(0, "2")
        self.sure.select_range(0, "end")
        self.sure.focus_set()
        self.onay_satiri("Ekle")
        self.wait_window()

    def topla(self):
        try:
            deger = float(self.sure.get().replace(",", "."))
            return deger if deger > 0 else None
        except ValueError:
            return None


class YaziDiyalog(Diyalog):
    def __init__(self, kok):
        super().__init__(kok, "Yazı Ekle")
        self.etiket("Bot ne yazsın? (tıkladığı yere bu metni yazar)")
        self.metin = tk.Entry(self.govde, font=FONT, bg=KART_2, fg=YAZI,
                              insertbackground=YAZI, relief="flat", width=40)
        self.metin.pack(fill="x", ipady=5)
        self.metin.focus_set()
        self.onay_satiri("Ekle")
        self.wait_window()

    def topla(self):
        metin = self.metin.get()
        return metin if metin else None


class TusDiyalog(Diyalog):
    TUSLAR = ["enter", "tab", "esc", "space", "backspace", "delete",
              "up", "down", "left", "right", "home", "end",
              "pageup", "pagedown", "f1", "f2", "f3", "f4", "f5"]

    def __init__(self, kok):
        super().__init__(kok, "Tuş Ekle")
        self.etiket("Hangi tuşa basılsın?")
        self.tus = ttk.Combobox(self.govde, state="readonly", values=self.TUSLAR)
        self.tus.current(0)
        self.tus.pack(fill="x")
        self.onay_satiri("Ekle")
        self.wait_window()

    def topla(self):
        return self.tus.get() or None


# ------------------------------------------------------------- ana pencere
class ButonBotu:
    def __init__(self, kok):
        self.kok = kok
        kok.title("Buton Botu")
        kok.geometry("460x640")
        kok.configure(bg=ARKA)
        kok.resizable(False, False)

        self.adimlar = []          # tarif adımları (dict listesi)
        self.calistirici = None
        self.mesgul = False

        self._kur()

    # ------------------------------------------------------------- arayüz
    def _kur(self):
        # başlık
        ust = tk.Frame(self.kok, bg=ARKA)
        ust.pack(fill="x", padx=18, pady=(16, 8))
        tk.Label(ust, text="Buton Botu", bg=ARKA, fg=YAZI,
                 font=("Segoe UI", 17, "bold")).pack(anchor="w")
        tk.Label(ust, text="Tarifi kur, bot butonları ekranda kendisi bulup tıklasın.",
                 bg=ARKA, fg=SOLUK, font=FONT_K).pack(anchor="w")

        # ---- adım ekleme kartı
        kart_ekle = kart_yap(self.kok, "ADIM EKLE")
        kart_ekle.pack(fill="x", padx=18, pady=6)
        satir = tk.Frame(kart_ekle, bg=KART)
        satir.pack(fill="x", padx=12, pady=(2, 12))
        buton_yap(satir, "📷 Buton", MAVI, self.buton_adimi).pack(side="left", expand=True, fill="x", padx=2)
        buton_yap(satir, "⏱ Bekle", KART_2, self.bekle_adimi).pack(side="left", expand=True, fill="x", padx=2)
        buton_yap(satir, "⌨ Yazı", KART_2, self.yazi_adimi).pack(side="left", expand=True, fill="x", padx=2)
        buton_yap(satir, "↵ Tuş", KART_2, self.tus_adimi).pack(side="left", expand=True, fill="x", padx=2)

        # ---- tarif listesi kartı
        kart_liste = kart_yap(self.kok, "TARİF  (bot bunları sırayla yapar)")
        kart_liste.pack(fill="both", expand=True, padx=18, pady=6)

        orta = tk.Frame(kart_liste, bg=KART)
        orta.pack(fill="both", expand=True, padx=12, pady=(2, 6))
        self.liste = tk.Listbox(
            orta, bg=KART_2, fg=YAZI, font=FONT,
            selectbackground=MAVI, selectforeground="white",
            relief="flat", highlightthickness=0, activestyle="none",
        )
        self.liste.pack(side="left", fill="both", expand=True)
        kaydir = tk.Scrollbar(orta, command=self.liste.yview)
        kaydir.pack(side="right", fill="y")
        self.liste.config(yscrollcommand=kaydir.set)

        arac = tk.Frame(kart_liste, bg=KART)
        arac.pack(fill="x", padx=12, pady=(0, 12))
        for metin, komut in (("↑", self.yukari), ("↓", self.asagi), ("✕ Sil", self.sil)):
            buton_yap(arac, metin, KART_2, komut).pack(side="left", padx=2)
        buton_yap(arac, "📂 Aç", KART_2, self.tarif_ac).pack(side="right", padx=2)
        buton_yap(arac, "💾 Kaydet", KART_2, self.tarif_kaydet_tikla).pack(side="right", padx=2)

        # ---- çalıştırma kartı
        kart_calistir = kart_yap(self.kok, "ÇALIŞTIR")
        kart_calistir.pack(fill="x", padx=18, pady=6)

        ayar = tk.Frame(kart_calistir, bg=KART)
        ayar.pack(fill="x", padx=12)
        tk.Label(ayar, text="Tekrar sayısı (0 = sonsuz):", bg=KART, fg=YAZI,
                 font=FONT).pack(side="left")
        self.tekrar = tk.Spinbox(ayar, from_=0, to=99999, width=6, font=FONT,
                                 bg=KART_2, fg=YAZI, relief="flat",
                                 buttonbackground=KART_2)
        self.tekrar.delete(0, "end")
        self.tekrar.insert(0, "1")
        self.tekrar.pack(side="left", padx=8)

        calistir_satir = tk.Frame(kart_calistir, bg=KART)
        calistir_satir.pack(fill="x", padx=12, pady=(8, 12))
        self.baslat_buton = buton_yap(calistir_satir, "▶  BAŞLAT", YESIL,
                                      self.calistir, buyuk=True)
        self.baslat_buton.pack(side="left", fill="x", expand=True, padx=(0, 4))
        self.durdur_buton = buton_yap(calistir_satir, "⏹  Durdur", KIRMIZI,
                                      self.durdur, buyuk=True)
        self.durdur_buton.pack(side="left", fill="x", expand=True, padx=(4, 0))
        self.durdur_buton.config(state="disabled")

        # ---- durum çubuğu
        self.durum_etiket = tk.Label(
            self.kok, text="Hazır. Önce '📷 Buton' ile ekrandan bir buton tanıt.",
            bg=KART, fg=SOLUK, font=FONT_K, anchor="w", padx=12, pady=7,
        )
        self.durum_etiket.pack(side="bottom", fill="x")

    # ------------------------------------------------------------ yardımcı
    def durum(self, metin, renk=SOLUK):
        self.durum_etiket.config(text=metin, fg=renk)

    def listeyi_ciz(self):
        self.liste.delete(0, "end")
        for i, adim in enumerate(self.adimlar, 1):
            self.liste.insert("end", f"  {i}.  {self._adim_metni(adim)}")

    @staticmethod
    def _adim_metni(adim):
        tip = adim["tip"]
        if tip == "butona_tikla":
            ad = os.path.splitext(os.path.basename(adim["resim"]))[0]
            sekil = {"sol": "tıkla", "cift": "çift tıkla", "sag": "sağ tıkla"}[adim.get("tiklama", "sol")]
            return f"📷  '{ad}' butonunu bul ve {sekil}"
        if tip == "bekle":
            return f"⏱  {adim['sure']} saniye bekle"
        if tip == "yazi":
            kisa = adim["metin"][:28] + ("…" if len(adim["metin"]) > 28 else "")
            return f"⌨  Yaz: \"{kisa}\""
        if tip == "tus":
            return f"↵  '{adim['tus']}' tuşuna bas"
        return "?"

    def _secili(self):
        secim = self.liste.curselection()
        return secim[0] if secim else None

    # -------------------------------------------------------- adım ekleme
    def buton_adimi(self):
        if self.mesgul:
            return
        self.durum("Butonun olduğu pencereyi öne getir — 3 saniye sonra ekran fotoğrafı çekilecek!", TURUNCU)
        self.kok.withdraw()
        self.kok.after(3000, self._foto_cek)

    def _foto_cek(self):
        resim = pyautogui.screenshot()
        BolgeSecici(self.kok, resim, self._secim_bitti)

    def _secim_bitti(self, kirpik):
        self.kok.deiconify()
        if kirpik is None:
            self.durum("Seçim iptal edildi.")
            return

        os.makedirs(BUTON_KLASORU, exist_ok=True)
        sayi = 1
        while os.path.exists(os.path.join(BUTON_KLASORU, f"buton{sayi}.png")):
            sayi += 1

        ayar = ButonAyarDiyalog(self.kok, f"buton{sayi}").sonuc
        if not ayar:
            self.durum("Vazgeçildi.")
            return

        yol = os.path.join(BUTON_KLASORU, f"{ayar['ad']}.png")
        kirpik.save(yol)
        self.adimlar.append({
            "tip": "butona_tikla",
            "resim": yol,
            "tiklama": ayar["tiklama"],
            "zaman_asimi": ayar["zaman_asimi"],
            "zorunlu": True,
        })
        self.listeyi_ciz()
        self.durum(f"'{ayar['ad']}' butonu tarife eklendi.", YESIL)

    def bekle_adimi(self):
        sure = BekleDiyalog(self.kok).sonuc
        if sure:
            self.adimlar.append({"tip": "bekle", "sure": sure})
            self.listeyi_ciz()

    def yazi_adimi(self):
        metin = YaziDiyalog(self.kok).sonuc
        if metin:
            self.adimlar.append({"tip": "yazi", "metin": metin})
            self.listeyi_ciz()

    def tus_adimi(self):
        tus = TusDiyalog(self.kok).sonuc
        if tus:
            self.adimlar.append({"tip": "tus", "tus": tus})
            self.listeyi_ciz()

    # ------------------------------------------------------ liste işlemleri
    def sil(self):
        i = self._secili()
        if i is None:
            self.durum("Silmek için listeden bir adım seç.", TURUNCU)
            return
        del self.adimlar[i]
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

    # ------------------------------------------------------------ çalıştır
    def calistir(self):
        if self.mesgul:
            return
        if not self.adimlar:
            self.durum("Önce tarife adım ekle (📷 Buton ile başla).", TURUNCU)
            return
        try:
            tekrar = max(0, int(self.tekrar.get()))
        except ValueError:
            tekrar = 1

        self.mesgul = True
        self.baslat_buton.config(state="disabled")
        self.durdur_buton.config(state="normal")
        self.durum("3 saniye içinde başlıyor — hedef pencereyi öne getir! (Durdur: ESC)", TURUNCU)
        self.kok.iconify()

        self.calistirici = TarifCalistirici(list(self.adimlar), durum_yaz=self._is_durumu)
        threading.Thread(target=self._calis, args=(tekrar,), daemon=True).start()

    def _calis(self, tekrar):
        if not self.calistirici.durduruldu.wait(timeout=3):
            basarili, mesaj = self.calistirici.calistir(tekrar)
        else:
            basarili, mesaj = False, "İptal edildi."
        self.kok.after(0, lambda: self._bitti(basarili, mesaj))

    def _is_durumu(self, mesaj):
        self.kok.after(0, lambda: self.durum(mesaj, YAZI))

    def _bitti(self, basarili, mesaj):
        self.kok.deiconify()
        self.mesgul = False
        self.baslat_buton.config(state="normal")
        self.durdur_buton.config(state="disabled")
        self.durum(mesaj, YESIL if basarili else KIRMIZI)
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
