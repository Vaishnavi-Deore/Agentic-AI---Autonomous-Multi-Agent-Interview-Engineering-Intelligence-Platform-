@echo off
TITLE PrepMind AI - Multi-Agent Interview Platform
color 0b

echo =========================================================================
echo             PrepMind AI - Multi-Agent Interview Intelligence
echo       Powered by Agentic AI, RAG, Vector DB, and Reflexion Evaluator
echo =========================================================================
echo.

echo [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...
start "PrepMind Backend (FastAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "PrepMind Frontend (Vite React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =========================================================================
echo  PrepMind AI is starting up!
echo  Frontend URL: http://localhost:5173
echo  Backend Docs: http://127.0.0.1:8000/docs
echo =========================================================================
echo.
pause
