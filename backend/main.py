from typing import Annotated
from urllib.error import URLError

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, StringConstraints

from recommender import AnimeRecommender
from streaming import get_streaming_sources

app = FastAPI(
    title="Anime Recommender ML API",
    description="Machine Learning API for Content-Based and Personalized Anime Recommendations",
    version="1.0.0"
)

# The public API does not use cookies or authenticated requests.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Initialize ML recommender engine
recommender = AnimeRecommender()

class SimilarRequest(BaseModel):
    anime_id: int = Field(gt=0)
    top_n: int = Field(default=10, ge=1, le=100)
    min_score: float = Field(default=0.0, ge=0, le=10)

class PersonalizedRequest(BaseModel):
    favorite_ids: list[int] | None = Field(default_factory=list)
    favorite_genres: list[str] | None = Field(default_factory=list)
    min_score: float = Field(default=0.0, ge=0, le=10)
    top_n: int = Field(default=12, ge=1, le=100)

class TextRequest(BaseModel):
    query: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=1000)]
    min_score: float = Field(default=0.0, ge=0, le=10)
    top_n: int = Field(default=12, ge=1, le=100)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Anime Recommender System ML Backend",
        "total_anime": len(recommender.df),
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/anime")
def get_anime(
    search: Annotated[str, Query(description="Search by title or English name")] = "",
    genre: Annotated[list[str] | None, Query(description="Match any selected genre")] = None,
    min_score: Annotated[float, Query(ge=0, le=10, description="Minimum MAL score")] = 0.0,
    limit: Annotated[int, Query(ge=1, le=500, description="Results per page")] = 100,
    page: Annotated[int, Query(ge=1, description="Page number")] = 1,
):
    results, total_count = recommender.get_all_anime(
        search=search, genre=genre, min_score=min_score, limit=limit, page=page
    )
    return {
        "total_count": total_count,
        "count": len(results),
        "page": page,
        "limit": limit,
        "data": results,
    }

@app.get("/api/anime/{anime_id}")
def get_anime_by_id(anime_id: int):
    anime = recommender.get_anime_by_id(anime_id)
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found")
    return anime

@app.get("/api/anime/{anime_id}/streaming")
def get_anime_streaming(anime_id: int):
    anime = recommender.get_anime_by_id(anime_id)
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found")
    try:
        sources = get_streaming_sources(anime_id)
    except (URLError, OSError, ValueError) as error:
        raise HTTPException(
            status_code=503,
            detail="Streaming availability could not be checked. Please try again shortly."
        ) from error
    return {
        "anime_id": anime_id,
        "title": anime.get('english_name') or anime['name'],
        "sources": sources,
        "listing_url": f"https://myanimelist.net/anime/{anime_id}",
    }

@app.post("/api/recommend/similar")
def recommend_similar(req: SimilarRequest):
    results = recommender.recommend_by_anime_id(
        anime_id=req.anime_id, top_n=req.top_n, min_score=req.min_score
    )
    if not results and not recommender.get_anime_by_id(req.anime_id):
        raise HTTPException(status_code=404, detail=f"Anime ID {req.anime_id} not found")
    return {
        "seed_anime_id": req.anime_id,
        "count": len(results),
        "recommendations": results
    }

@app.post("/api/recommend/personalized")
def recommend_personalized(req: PersonalizedRequest):
    results = recommender.recommend_by_user_profile(
        favorite_ids=req.favorite_ids,
        favorite_genres=req.favorite_genres,
        min_score=req.min_score,
        top_n=req.top_n
    )
    return {
        "user_profile": {
            "favorite_ids": req.favorite_ids,
            "favorite_genres": req.favorite_genres,
            "min_score": req.min_score
        },
        "count": len(results),
        "recommendations": results
    }

@app.post("/api/recommend/text")
def recommend_from_description(req: TextRequest):
    results = recommender.recommend_by_text(
        query=req.query, min_score=req.min_score, top_n=req.top_n
    )
    return {
        "query": req.query,
        "count": len(results),
        "recommendations": results
    }

@app.get("/api/ml-info")
def get_ml_info():
    return recommender.get_model_info()

@app.get("/api/genres")
def get_genres():
    info = recommender.get_model_info()
    return {
        "genres": list(info["genre_distribution"].keys()),
        "counts": info["genre_distribution"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
