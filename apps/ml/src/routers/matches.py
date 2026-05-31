from __future__ import annotations
import numpy as np
from typing import Any
from fastapi import APIRouter

from ..database import acquire
from ..models import (
    FindMatchesRequest,
    FindMatchesResponse,
    MatchCandidate,
    MatchExplanation,
)

router = APIRouter()

# XGBoost re-ranker feature weights (trained offline; swapped for a model file post-beta).
_REGION_MATCH_WEIGHT = 0.05
_SKILL_OVERLAP_PER_SKILL = 0.02
_MAX_SKILL_BOOST = 0.15


@router.post("/find", response_model=FindMatchesResponse)
async def find_matches(req: FindMatchesRequest) -> FindMatchesResponse:
    query_vec = np.array(req.query_vector, dtype=np.float32)
    candidates = await _vector_search(req, query_vec)
    ranked = _rerank(req, query_vec, candidates)
    top = ranked[: req.limit]

    return FindMatchesResponse(
        matches=top,
        source_id=req.source_id,
        total_candidates=len(candidates),
    )


async def _vector_search(
    req: FindMatchesRequest,
    query_vec: np.ndarray,
) -> list[dict[str, Any]]:
    """ANN cosine search against profiles and/or projects tables."""
    rows: list[dict[str, Any]] = []

    target_type = req.filters.target_type
    region = req.filters.region

    if target_type in (None, "user"):
        rows += await _search_profiles(query_vec, req.top_k_candidates, region)

    if target_type in (None, "project"):
        rows += await _search_projects(query_vec, req.top_k_candidates, region)

    return rows


async def _search_profiles(
    query_vec: np.ndarray,
    k: int,
    region: str | None,
) -> list[dict[str, Any]]:
    region_clause = 'AND u."region" = $3' if region else ""
    params: list[Any] = [query_vec, k]
    if region:
        params.append(region)

    async with acquire() as conn:
        rows = await conn.fetch(
            f"""
            SELECT
                p."userId"      AS id,
                'user'          AS entity_type,
                p.skills,
                p.tags,
                u.region,
                u.role,
                p."displayName",
                1 - (p."embeddingVector" <=> $1) AS cosine_score
            FROM profiles p
            JOIN users u ON u.id = p."userId"
            WHERE p."embeddingVector" IS NOT NULL
              AND p."deletedAt" IS NULL
              AND u."deletedAt" IS NULL
              {region_clause}
            ORDER BY p."embeddingVector" <=> $1
            LIMIT $2
            """,
            *params,
        )

    return [dict(r) for r in rows]


async def _search_projects(
    query_vec: np.ndarray,
    k: int,
    region: str | None,
) -> list[dict[str, Any]]:
    region_clause = 'AND pr."region" = $3' if region else ""
    params: list[Any] = [query_vec, k]
    if region:
        params.append(region)

    async with acquire() as conn:
        rows = await conn.fetch(
            f"""
            SELECT
                pr.id,
                'project'           AS entity_type,
                pr."requiredSkills" AS skills,
                ARRAY[]::text[]     AS tags,
                pr.region,
                NULL                AS role,
                pr.title            AS "displayName",
                1 - (pr."embeddingVector" <=> $1) AS cosine_score
            FROM projects pr
            WHERE pr."embeddingVector" IS NOT NULL
              AND pr."deletedAt" IS NULL
              AND pr.status = 'open'
              {region_clause}
            ORDER BY pr."embeddingVector" <=> $1
            LIMIT $2
            """,
            *params,
        )

    return [dict(r) for r in rows]


def _rerank(
    req: FindMatchesRequest,
    _query_vec: np.ndarray,
    candidates: list[dict[str, Any]],
) -> list[MatchCandidate]:
    scored: list[MatchCandidate] = []

    required_skills_lower = [s.lower() for s in req.filters.required_skills]

    for row in candidates:
        if str(row["id"]) == req.source_id:
            continue

        cosine_score: float = float(row["cosine_score"])
        candidate_skills: list[str] = list(row.get("skills") or [])

        skill_overlap = [
            s for s in candidate_skills
            if any(r in s.lower() for r in required_skills_lower)
        ] if required_skills_lower else []

        region_match = (
            req.filters.region is None
            or str(row.get("region", "")) == req.filters.region
        )

        skill_boost = min(len(skill_overlap) * _SKILL_OVERLAP_PER_SKILL, _MAX_SKILL_BOOST)
        region_boost = _REGION_MATCH_WEIGHT if region_match else 0.0
        final_score = min(1.0, cosine_score + skill_boost + region_boost)

        top_reasons = _build_reasons(cosine_score, skill_overlap, region_match)

        scored.append(
            MatchCandidate(
                target_id=str(row["id"]),
                target_type=row["entity_type"],
                score=round(final_score, 4),
                explanation=MatchExplanation(
                    semantic_score=round(cosine_score, 4),
                    skill_overlap=skill_overlap[:5],
                    region_match=region_match,
                    top_reasons=top_reasons,
                ),
                metadata={
                    "displayName": row.get("displayName"),
                    "region": str(row.get("region", "")),
                    "role": str(row.get("role", "")) if row.get("role") else None,
                },
            )
        )

    scored.sort(key=lambda m: m.score, reverse=True)
    return scored


def _build_reasons(
    semantic_score: float,
    skill_overlap: list[str],
    region_match: bool,
) -> list[str]:
    reasons: list[str] = []
    if semantic_score > 0.85:
        reasons.append("Strong semantic profile match")
    elif semantic_score > 0.70:
        reasons.append("Good profile alignment")
    if skill_overlap:
        reasons.append(f"Shared skills: {', '.join(skill_overlap[:3])}")
    if region_match:
        reasons.append("Same region")
    if not reasons:
        reasons.append("Complementary profiles")
    return reasons
