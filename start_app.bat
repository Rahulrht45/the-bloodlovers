@echo off
echo Starting Bloodlovers MVP Environment...

:: Start Frontend
start "Frontend" cmd /k "npm run dev"

:: Start Node Backend (AI Chat)
start "AI Backend" cmd /k "cd backend-node && npm start"

:: Start Python Backend (Legacy/Stats)
:: Uncomment if you need the Python backend running simultaneously
:: start "Python Backend" cmd /k "backend\venv\Scripts\activate && python backend\main.py"

echo All services starting...
echo Access Frontend at: http://localhost:5173
echo Access AI Backend at: http://localhost:3000
pause
