import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ddtrace.contrib.starlette import TraceMiddleware
from .routers import embeddings, matches

app = FastAPI(title="V.B ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TraceMiddleware)

app.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ml", "region": os.getenv("REGION", "unknown")}
