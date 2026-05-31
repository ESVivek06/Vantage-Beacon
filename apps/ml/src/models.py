from __future__ import annotations
from typing import Literal, Any
from pydantic import BaseModel, Field


# ── Embedding models ──────────────────────────────────────────────────────────

class EmbedRequest(BaseModel):
    text: str
    entity_id: str | None = None
    entity_type: Literal["user", "project"] | None = None
    persist: bool = False


class EmbedResponse(BaseModel):
    vector: list[float]
    dimensions: int
    model: str


class BatchEmbedRequest(BaseModel):
    items: list[EmbedRequest]


class BatchEmbedResponse(BaseModel):
    results: list[EmbedResponse]


# ── Matching models ───────────────────────────────────────────────────────────

class MatchFilter(BaseModel):
    region: Literal["UK", "IN", "NA"] | None = None
    required_skills: list[str] = Field(default_factory=list)
    domain: str | None = None
    target_type: Literal["user", "project"] | None = None
    target_role: str | None = None


class FindMatchesRequest(BaseModel):
    source_id: str
    query_vector: list[float]
    match_type: Literal["freelancer_to_project", "founder_to_investor", "user_to_user"]
    filters: MatchFilter = Field(default_factory=MatchFilter)
    limit: int = Field(default=20, ge=1, le=100)
    top_k_candidates: int = Field(default=100, ge=10, le=500)


class MatchExplanation(BaseModel):
    semantic_score: float
    skill_overlap: list[str]
    region_match: bool
    top_reasons: list[str]


class MatchCandidate(BaseModel):
    target_id: str
    target_type: Literal["user", "project"]
    score: float
    explanation: MatchExplanation
    metadata: dict[str, Any]


class FindMatchesResponse(BaseModel):
    matches: list[MatchCandidate]
    source_id: str
    total_candidates: int
