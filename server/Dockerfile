# ----------------------------- Stage 1: Build Stage (builder) -----------------------------
FROM python:3.11-slim AS builder

WORKDIR /app

# Install GCC and system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       libc6-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependency list
COPY requirements.txt ./

# Install Python dependencies (fastapi, uvicorn, etc.)
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and C source
COPY ./app    ./app
COPY ./c_src  ./c_src

# Compile C source into shared library
RUN mkdir -p shared_libs \
    && gcc -O2 -std=c99 -fPIC -shared \
           -o shared_libs/libtest.so \
           c_src/test.c

# ----------------------------- Stage 2: Runtime Stage -----------------------------
FROM python:3.11-slim

WORKDIR /app

# Install minimal runtime system libraries (e.g., libc6), excluding GCC
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libc6 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 1. Copy installed Python packages from the builder stage's site-packages
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
# (If pip placed executables in /usr/local/bin, copy them as well)
COPY --from=builder /usr/local/bin /usr/local/bin

# 2. Copy compiled shared libraries and source code
COPY --from=builder /app/shared_libs ./shared_libs
COPY --from=builder /app/app         ./app

# (Optional: Copy requirements.txt for version reference)
COPY --from=builder /app/requirements.txt ./

# Container exposed port
EXPOSE 8000

# Startup command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]