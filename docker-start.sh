#!/usr/bin/env bash
# ==============================================================================
# PrepMind AI - Docker Production Launch Script (Linux / macOS)
# ==============================================================================

set -e

echo "========================================================================="
echo "            PrepMind AI - Docker Production Deployment"
echo "        Building and launching Backend & Frontend containers..."
echo "========================================================================="

if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

echo "[1/2] Building and launching containers via Docker Compose..."
docker compose up --build -d

echo ""
echo "[2/2] Checking container status..."
docker compose ps

echo ""
echo "========================================================================="
echo " PrepMind AI is now running in Docker containers!"
echo " Web Application: http://localhost:3000  (or http://localhost)"
echo " API Docs:        http://localhost:8000/docs"
echo "========================================================================="
echo ""
echo "To view live logs: docker compose logs -f"
echo "To stop:           docker compose down"
echo ""
