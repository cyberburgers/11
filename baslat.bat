@echo off
chcp 65001 >nul
python arayuz.py
if errorlevel 1 pause
