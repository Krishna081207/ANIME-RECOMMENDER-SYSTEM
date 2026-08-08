import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from recommender import AnimeRecommender

app = FastAPI(
    title="Anime Recommender ML API",
    description="Machine Learning API for Content-Based and Personalized Anime Recommendations",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default port 5173 / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML recommender engine
recommender = AnimeRecommender()

class SimilarRequest(BaseModel):
    anime_id: int
    top_n: Optional[int] = 10

class PersonalizedRequest(BaseModel):
    favorite_ids: Optional[List[int]] = []
    favorite_genres: Optional[List[str]] = []
    min_score: Optional[float] = 0.0
    top_n: Optional[int] = 12

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
    search: Optional[str] = Query("", description="Search by title or english name"),
    genre: Optional[str] = Query("", description="Filter by genre"),
    min_score: Optional[float] = Query(0.0, description="Minimum MAL score threshold"),
    limit: Optional[int] = Query(100, description="Limit results per page"),
    page: Optional[int] = Query(1, description="Page number")
):
    results, total_count = recommender.get_all_anime(
        search=search, genre=genre, min_score=min_score, limit=limit, page=page
    )
    return {
        "total_count": total_count,
        "count": len(results),
        "page": page,
        "limit": limit,
        "data": results
    }

@app.get("/api/anime/{anime_id}")
def get_anime_by_id(anime_id: int):
    anime = recommender.get_anime_by_id(anime_id)
    if not anime:
        raise HTTPException(status_code=404, detail="Anime not found")
    return anime

@app.post("/api/recommend/similar")
def recommend_similar(req: SimilarRequest):
    results = recommender.recommend_by_anime_id(anime_id=req.anime_id, top_n=req.top_n)
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
