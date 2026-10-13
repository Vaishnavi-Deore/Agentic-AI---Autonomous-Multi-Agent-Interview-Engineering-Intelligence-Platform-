@echo off
TITLE PrepMind AI - Docker Production Launch
color 0a

echo =========================================================================
echo             PrepMind AI - Docker Production Deployment
echo         Building and launching Backend & Frontend containers...
echo =========================================================================
echo.

REM Check if docker command exists
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo.
    echo Alternatively, run the project natively using "start_project.bat"!
    echo.
    pause
    exit /b 1
)

echo [1/2] Building and launching containers via Docker Compose...
docker compose up --build -d

echo.
echo [2/2] Checking container status...
docker compose ps

echo.
echo =========================================================================
echo  PrepMind AI is now running in Docker containers!
echo  Web Application: http://localhost:3000  (or http://localhost)
echo  API Docs:        http://localhost:8000/docs
echo =========================================================================
echo.
echo To view container logs, run: docker compose logs -f
echo To stop containers, run:      docker compose down
echo.
pause
