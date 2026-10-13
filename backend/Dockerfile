# ==============================================================================
# PrepMind AI - Production Backend Dockerfile
# Multi-Agent Interview Intelligence Platform (FastAPI + Python 3.11)
# ==============================================================================

FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered output for live logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies including curl for container healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app/

# Create a non-root user for production container security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose backend REST API port
EXPOSE 8000

# Container healthcheck querying FastAPI /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start production uvicorn ASGI server
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
