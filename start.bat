@echo off
echo ==========================================================
echo Starting ResearchGap AI (Version 2.0)...
echo ==========================================================

start "ResearchGap Backend" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul

cd frontend
start "ResearchGap Frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Application is starting!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000/docs
echo ==========================================================
pause
