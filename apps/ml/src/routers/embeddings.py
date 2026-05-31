import os
import numpy as np
from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI

from ..database import acquire
from ..models import (
    EmbedRequest,
    EmbedResponse,
    BatchEmbedRequest,
    BatchEmbedResponse,
)

router = APIRouter()

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

_openai: AsyncOpenAI | None = None


def _client() -> AsyncOpenAI:
    global _openai
    if _openai is None:
        _openai = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
    return _openai


async def _embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    response = await _client().embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    ordered = sorted(response.data, key=lambda d: d.index)
    return [d.embedding for d in ordered]


async def _persist_vector(
    entity_id: str,
    entity_type: str,
    vector: list[float],
) -> None:
    arr = np.array(vector, dtype=np.float32)
    if entity_type == "user":
        async with acquire() as conn:
            await conn.execute(
                """
                UPDATE profiles
                SET "embeddingVector" = $1, "updatedAt" = NOW()
                WHERE "userId" = $2
                """,
                arr,
                entity_id,
            )
    elif entity_type == "project":
        async with acquire() as conn:
            await conn.execute(
                """
                UPDATE projects
                SET "embeddingVector" = $1, "updatedAt" = NOW()
                WHERE id = $2
                """,
                arr,
                entity_id,
            )


@router.post("/embed", response_model=EmbedResponse)
async def embed_single(req: EmbedRequest) -> EmbedResponse:
    vectors = await _embed_texts([req.text])
    vector = vectors[0]

    if req.persist and req.entity_id and req.entity_type:
        try:
            await _persist_vector(req.entity_id, req.entity_type, vector)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Persist failed: {exc}") from exc

    return EmbedResponse(
        vector=vector,
        dimensions=EMBEDDING_DIMENSIONS,
        model=EMBEDDING_MODEL,
    )


@router.post("/batch", response_model=BatchEmbedResponse)
async def embed_batch(req: BatchEmbedRequest) -> BatchEmbedResponse:
    texts = [item.text for item in req.items]
    vectors = await _embed_texts(texts)

    results: list[EmbedResponse] = []
    for item, vector in zip(req.items, vectors):
        if item.persist and item.entity_id and item.entity_type:
            try:
                await _persist_vector(item.entity_id, item.entity_type, vector)
            except Exception as exc:
                raise HTTPException(
                    status_code=500,
                    detail=f"Persist failed for {item.entity_id}: {exc}",
                ) from exc

        results.append(
            EmbedResponse(
                vector=vector,
                dimensions=EMBEDDING_DIMENSIONS,
                model=EMBEDDING_MODEL,
            )
        )

    return BatchEmbedResponse(results=results)
