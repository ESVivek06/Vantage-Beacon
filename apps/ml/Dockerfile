FROM python:3.11-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*
COPY apps/ml/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM base AS runner
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && \
    rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --gecos "" mluser
COPY --chown=mluser:mluser apps/ml/src ./src

USER mluser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
