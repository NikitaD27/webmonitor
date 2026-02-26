@echo off
echo Starting WebMonitor Backend...
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
pause
