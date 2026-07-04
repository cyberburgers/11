@echo off
chcp 65001 >nul
echo Gerekli kutuphane kuruluyor (pynput)...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo HATA: Kurulum basarisiz. Python kurulu mu? https://www.python.org/downloads/
    echo Python kurarken "Add Python to PATH" kutusunu isaretlemeyi unutma!
)
echo.
echo Kurulum tamam. Botu baslatmak icin baslat.bat dosyasina cift tikla.
pause
