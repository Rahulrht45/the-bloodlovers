@echo off
cd /d %~dp0
echo Starting Python Backend Server...
call backend\venv\Scripts\activate.bat
python backend\main.py
pause
