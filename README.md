# Anime Recommender System

A hybrid recommendation engine that suggests anime titles by combining **content-based filtering** (genre, synopsis, tags) with **collaborative filtering** (user rating patterns).

## Overview

Most recommenders rely on a single signal. This project blends two:

- **Content-based** — finds anime similar in genre, synopsis, and metadata using TF-IDF / embedding similarity.
- **Collaborative** — finds anime liked by users with similar taste profiles, using matrix factorization on the user–item rating matrix.

The two scores are combined (weighted or model-stacked) into a single ranked recommendation list, addressing the cold-start weakness of pure collaborative filtering and the narrow-taste weakness of pure content-based filtering.

## Features

- Search by anime title → get top-N similar titles
- Search by user ID → get personalized recommendations
- Adjustable weighting between content and collaborative scores
- Handles cold-start (new anime / new users) via content-based fallback

## Tech Stack

- **Language:** Python
- **Data handling:** pandas, NumPy
- **Content-based:** scikit-learn (TF-IDF, cosine similarity)
- **Collaborative:** matrix factorization (SVD / ALS)
- **Dataset:** MyAnimeList / Anime Recommendation dataset (anime.csv, ratings.csv)

## Project Structure

```
anime-recommender/
├── data/
│   ├── anime.csv
│   └── ratings.csv
├── src/
│   ├── content_based.py
│   ├── collaborative.py
│   ├── hybrid.py
│   └── utils.py
├── notebooks/
│   └── eda.ipynb
├── requirements.txt
└── README.md
```

## Installation

```bash
git clone <repo-url>
cd anime-recommender
pip install -r requirements.txt
```

## Usage

```python
from src.hybrid import HybridRecommender

model = HybridRecommender(content_weight=0.5, collab_weight=0.5)
model.fit(anime_df, ratings_df)

# By title
model.recommend_by_title("Death Note", top_n=10)

# By user
model.recommend_for_user(user_id=42, top_n=10)
```

## Evaluation

- Precision@K / Recall@K on held-out ratings
- RMSE for the collaborative component
- Qualitative check: genre/theme overlap in top recommendations

## Future Work

- Add deep learning-based embeddings (e.g., autoencoders) for content similarity
- Incorporate implicit feedback (watch time, drop rate)
- Deploy as a lightweight API / web app

## License

MIT
