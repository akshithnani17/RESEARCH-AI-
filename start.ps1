# ResearchGap AI - Automated Local Startup Script
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting ResearchGap AI (Version 2.0)..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start Backend in new process
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload" -NoNewWindow

# 2. Start Frontend in new process
Write-Host "[2/2] Launching Vite React Frontend on http://localhost:5173..." -ForegroundColor Green
Set-Location frontend
npm run dev -- --host 127.0.0.1 --port 5173
