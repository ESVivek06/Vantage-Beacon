import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import close_pool
from .routers import embeddings, matches

try:
    from ddtrace.contrib.starlette import TraceMiddleware
    _has_ddtrace = True
except ImportError:
    _has_ddtrace = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_pool()


app = FastAPI(title="V.B ML Service", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
if _has_ddtrace:
    app.add_middleware(TraceMiddleware)

app.include_router(embeddings.router, prefix="/embeddings", tags=["embeddings"])
app.include_router(matches.router, prefix="/matches", tags=["matches"])


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ml",
        "region": os.getenv("REGION", "unknown"),
        "embedding_model": "text-embedding-3-small",
    }
