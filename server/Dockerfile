# ---------- Stage 1: build-stage, for installing dependencies and compiling C code ----------
FROM python:3.11-slim AS builder

WORKDIR /app

# 1. Install system dependencies (gcc, libc-dev etc.)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libc6-dev \
       make \
       findutils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy backend source code, C source code and Makefile
COPY app/        ./app
COPY data/      ./data/
COPY Makefile    ./

# 4. Run make to compile all .c → .so
RUN make all

# ---------- Stage 2: runtime-stage, build final runtime image --------------
FROM python:3.11-slim

WORKDIR /app

# 1. Install only necessary runtime system libraries (no gcc needed)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libc6 \
       gcc \
       libc6-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. Copy Python packages (site-packages) and executables (uvicorn etc.) from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 3. Copy compiled shared libraries and backend source code
COPY --from=builder /app/data/ ./data/
COPY --from=builder /app/app         ./app
COPY --from=builder /app/requirements.txt ./

# 4. Expose container port
EXPOSE 8000

# 5. Startup command: directly run Uvicorn, loading app.main
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]