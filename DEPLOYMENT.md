# 🚀 PrepMind AI - Production Deployment Guide

This guide details all production deployment pathways for PrepMind AI:
- **Docker Compose (Recommended for Local / VPS / AWS EC2 / DigitalOcean)**
- **Cloud 1-Click Deployment (Render / Railway / Fly.io)**
- **Native Production Deployment (Linux / Windows Server)**

---

## 🐳 Option 1: Docker Compose Deployment (Recommended)

PrepMind AI includes a fully orchestrated Docker Compose setup with:
- **Backend**: FastAPI running on Python 3.11 with container health checks.
- **Frontend**: Nginx Alpine reverse-proxying `/api` to the backend and serving the production Vite build with Gzip compression and asset caching.

### Prerequisites:
- [Docker Engine & Docker Compose](https://docs.docker.com/get-docker/) installed.

### 1. Build & Run Containers:
```bash
# Clone the repository and navigate to root directory
cd "Agentic AI Project"

# Launch both containers in background
docker compose up --build -d
```

On Windows, simply double-click **`docker-start.bat`**.  
On Linux/macOS, run **`./docker-start.sh`**.

### 2. Verify Container Health:
```bash
docker compose ps
```
Both `prepmind-ai-backend` and `prepmind-ai-frontend` should report status `Up (healthy)`.

### 3. Access Services:
- **Web App**: [http://localhost:3000](http://localhost:3000) or [http://localhost](http://localhost)
- **FastAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 4. Useful Docker Commands:
```bash
# Stream live multi-container logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Stop containers
docker compose down

# Stop and wipe container volumes
docker compose down -v
```

---

## ☁️ Option 2: Cloud 1-Click Deployment (Render)

PrepMind AI includes a ready-to-use [`render.yaml`](file:///c:/Users/deore/Desktop/Agentic%20AI%20Project/render.yaml) blueprint:
1. Push this repository to GitHub or GitLab.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Blueprint**.
3. Select this repository. Render automatically reads `render.yaml` and provisions:
   - `prepmind-ai-backend`: Python Web Service running Uvicorn.
   - `prepmind-ai-frontend`: Static Site serving Vite bundle with `/api/*` rewrites.

---

## 🌐 Option 3: Railway / Fly.io / AWS EC2

### For Railway:
1. Link your GitHub repo to Railway.
2. Add the backend service from `./backend` (auto-detects `Dockerfile`).
3. Add the frontend service from `./frontend` (auto-detects `Dockerfile`).

### For AWS EC2 / DigitalOcean Droplet:
```bash
# On your remote server:
sudo apt update && sudo apt install -y docker.io docker-compose-v2
git clone <your-repo-url>
cd "Agentic AI Project"
sudo docker compose up --build -d
```

---

## 🖥️ Option 4: Native Production Deployment (Without Docker)

### Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend:
```bash
cd frontend
npm install
npm run build
# Serve dist folder using Nginx, Caddy, or serve:
npx serve -s dist -l 3000
```
