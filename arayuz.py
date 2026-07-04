# -*- coding: utf-8 -*-
"""
Makro Botu — Basit Grafik Arayüz (tkinter)

Çalıştırmak için:  python arayuz.py

Kayıt sırasında bitirmek için klavyeden F9'a bas.
Oynatma sırasında durdurmak için ESC'ye (veya Durdur butonuna) bas.
"""

import threading
import time
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog

try:
    from pynput import keyboard
except ImportError:
    import sys
    print("HATA: 'pynput' kurulu değil. Kurmak için:  pip install pynput")
    sys.exit(1)

from bot import (
    Kaydedici,
    Oynatici,
    makro_kaydet,
    makro_yukle,
    makrolari_listele,
    MAKRO_KLASORU,
)
import os


class MakroArayuz:
    def __init__(self, kok):
        self.kok = kok
        kok.title("Makro Botu")
        kok.geometry("420x520")
        kok.resizable(False, False)

        self.kaydedici = None
        self.oynatici = None
        self.kayit_thread = None
        self.oynat_thread = None
        self.mesgul = False  # kayıt ya da oynatma sürüyor mu

        self._arayuzu_kur()
        self.listeyi_yenile()

    # ------------------------------------------------------------------ UI
    def _arayuzu_kur(self):
        baslik = tk.Label(self.kok, text="🖱️  Makro Botu", font=("Segoe UI", 16, "bold"))
        baslik.pack(pady=(12, 2))

        alt = tk.Label(
            self.kok,
            text="Tıklama ve tuşları kaydet, istediğin kadar tekrar oynat",
            font=("Segoe UI", 9),
            fg="#555",
        )
        alt.pack(pady=(0, 10))

        # --- Makro listesi ---
        cerceve_liste = tk.LabelFrame(self.kok, text=" Kayıtlı Makrolar ", padx=8, pady=8)
        cerceve_liste.pack(fill="both", expand=True, padx=12, pady=4)

        self.liste = tk.Listbox(cerceve_liste, height=6, font=("Segoe UI", 10))
        self.liste.pack(side="left", fill="both", expand=True)
        kaydirici = tk.Scrollbar(cerceve_liste, command=self.liste.yview)
        kaydirici.pack(side="right", fill="y")
        self.liste.config(yscrollcommand=kaydirici.set)

        buton_satiri = tk.Frame(self.kok)
        buton_satiri.pack(fill="x", padx=12, pady=(2, 8))
        tk.Button(buton_satiri, text="🔄 Yenile", command=self.listeyi_yenile).pack(side="left")
        tk.Button(buton_satiri, text="🗑️ Sil", command=self.makro_sil).pack(side="left", padx=6)

        # --- Kayıt ---
        cerceve_kayit = tk.LabelFrame(self.kok, text=" Kayıt ", padx=8, pady=8)
        cerceve_kayit.pack(fill="x", padx=12, pady=4)

        self.fare_hareketi = tk.BooleanVar(value=True)
        tk.Checkbutton(
            cerceve_kayit,
            text="Fare hareketlerini de kaydet",
            variable=self.fare_hareketi,
        ).pack(anchor="w")

        self.kayit_buton = tk.Button(
            cerceve_kayit,
            text="⏺  Yeni Kayıt Başlat",
            bg="#e53935",
            fg="white",
            font=("Segoe UI", 10, "bold"),
            command=self.kayit_baslat,
        )
        self.kayit_buton.pack(fill="x", pady=(6, 0))
        tk.Label(
            cerceve_kayit,
            text="Kaydı bitirmek için klavyeden  F9  tuşuna bas",
            font=("Segoe UI", 8),
            fg="#777",
        ).pack(anchor="w", pady=(4, 0))

        # --- Oynatma ---
        cerceve_oynat = tk.LabelFrame(self.kok, text=" Oynatma ", padx=8, pady=8)
        cerceve_oynat.pack(fill="x", padx=12, pady=4)

        satir = tk.Frame(cerceve_oynat)
        satir.pack(fill="x")
        tk.Label(satir, text="Tekrar (0 = sonsuz):").grid(row=0, column=0, sticky="w")
        self.tekrar = tk.Spinbox(satir, from_=0, to=99999, width=7)
        self.tekrar.delete(0, "end")
        self.tekrar.insert(0, "1")
        self.tekrar.grid(row=0, column=1, padx=(6, 16))

        tk.Label(satir, text="Hız:").grid(row=0, column=2, sticky="w")
        self.hiz = tk.Spinbox(satir, from_=0.1, to=10, increment=0.5, width=6, format="%.1f")
        self.hiz.delete(0, "end")
        self.hiz.insert(0, "1.0")
        self.hiz.grid(row=0, column=3, padx=(6, 0))

        oynat_buton_satiri = tk.Frame(cerceve_oynat)
        oynat_buton_satiri.pack(fill="x", pady=(8, 0))
        self.oynat_buton = tk.Button(
            oynat_buton_satiri,
            text="▶  Oynat",
            bg="#43a047",
            fg="white",
            font=("Segoe UI", 10, "bold"),
            command=self.oynat_baslat,
        )
        self.oynat_buton.pack(side="left", fill="x", expand=True)
        self.durdur_buton = tk.Button(
            oynat_buton_satiri,
            text="⏹  Durdur",
            command=self.durdur,
            state="disabled",
        )
        self.durdur_buton.pack(side="left", fill="x", expand=True, padx=(6, 0))

        # --- Durum çubuğu ---
        self.durum = tk.Label(
            self.kok,
            text="Hazır.",
            bd=1,
            relief="sunken",
            anchor="w",
            font=("Segoe UI", 9),
        )
        self.durum.pack(side="bottom", fill="x")

    # -------------------------------------------------------------- yardımcı
    def durum_yaz(self, metin):
        self.durum.config(text=metin)

    def listeyi_yenile(self):
        self.liste.delete(0, "end")
        for isim in makrolari_listele():
            self.liste.insert("end", isim)

    def secili_makro(self):
        secim = self.liste.curselection()
        if not secim:
            return None
        return self.liste.get(secim[0])

    def _mesgul_ayarla(self, deger):
        self.mesgul = deger
        durum = "disabled" if deger else "normal"
        self.kayit_buton.config(state=durum)
        self.oynat_buton.config(state=durum)

    # ---------------------------------------------------------------- kayıt
    def kayit_baslat(self):
        if self.mesgul:
            return
        self._mesgul_ayarla(True)
        self.durdur_buton.config(state="disabled")
        self.durum_yaz("● KAYIT sürüyor... Bitirmek için F9'a bas.")
        self.kok.iconify()  # pencereyi küçült ki karışmasın

        self.kaydedici = Kaydedici(fare_hareketi_kaydet=self.fare_hareketi.get())
        self.kayit_thread = threading.Thread(target=self._kayit_calis, daemon=True)
        self.kayit_thread.start()

    def _kayit_calis(self):
        olaylar = self.kaydedici.kaydet()  # F9'a kadar bloklar
        self.kok.after(0, lambda: self._kayit_bitti(olaylar))

    def _kayit_bitti(self, olaylar):
        self.kok.deiconify()
        self._mesgul_ayarla(False)
        if not olaylar:
            self.durum_yaz("Kayıt boş, bir şey kaydedilmedi.")
            return
        isim = simpledialog.askstring(
            "Makro Kaydet",
            f"{len(olaylar)} olay kaydedildi.\nMakroya bir isim ver:",
            initialvalue="makro1",
            parent=self.kok,
        )
        if not isim:
            self.durum_yaz("Kayıt iptal edildi (isim verilmedi).")
            return
        makro_kaydet(olaylar, isim)
        self.listeyi_yenile()
        self.durum_yaz(f"'{isim}' kaydedildi ({len(olaylar)} olay).")

    # -------------------------------------------------------------- oynatma
    def oynat_baslat(self):
        if self.mesgul:
            return
        isim = self.secili_makro()
        if not isim:
            messagebox.showwarning("Uyarı", "Önce listeden bir makro seç.")
            return
        try:
            tekrar = int(self.tekrar.get())
        except ValueError:
            tekrar = 1
        try:
            hiz = float(str(self.hiz.get()).replace(",", "."))
        except ValueError:
            hiz = 1.0

        olaylar = makro_yukle(isim)
        self.oynatici = Oynatici(olaylar, hiz=hiz)

        self._mesgul_ayarla(True)
        self.durdur_buton.config(state="normal")
        self.durum_yaz(f"▶ '{isim}' oynatılıyor... (3 sn sonra başlar, ESC = durdur)")

        self.oynat_thread = threading.Thread(
            target=self._oynat_calis, args=(tekrar,), daemon=True
        )
        self.oynat_thread.start()

    def _oynat_calis(self, tekrar):
        self.oynatici.oynat(tekrar=tekrar)
        self.kok.after(0, self._oynat_bitti)

    def _oynat_bitti(self):
        self._mesgul_ayarla(False)
        self.durdur_buton.config(state="disabled")
        self.durum_yaz("Oynatma bitti. Hazır.")

    def durdur(self):
        if self.oynatici:
            self.oynatici.durduruldu.set()
        self.durum_yaz("Durduruluyor...")

    # ------------------------------------------------------------------- sil
    def makro_sil(self):
        isim = self.secili_makro()
        if not isim:
            messagebox.showwarning("Uyarı", "Silmek için bir makro seç.")
            return
        if not messagebox.askyesno("Sil", f"'{isim}' makrosu silinsin mi?"):
            return
        yol = os.path.join(MAKRO_KLASORU, isim + ".json")
        try:
            os.remove(yol)
        except OSError as hata:
            messagebox.showerror("Hata", f"Silinemedi: {hata}")
            return
        self.listeyi_yenile()
        self.durum_yaz(f"'{isim}' silindi.")


def main():
    kok = tk.Tk()
    MakroArayuz(kok)
    kok.mainloop()


if __name__ == "__main__":
    main()
