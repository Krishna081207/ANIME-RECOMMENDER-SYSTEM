# Implementation Plan - Full-Stack Anime Recommender System (React + Python ML Backend)

Build a production-grade, portfolio-ready Anime Recommender System featuring a **React (Vite) visual frontend** and a **Python (FastAPI + Scikit-Learn) Machine Learning backend** trained on Kaggle-style anime data. The application will compute content-based and personalized recommendations, explain ML match scores, showcase streaming sources (Crunchyroll, Netflix, Hulu, MAL, etc.), and provide an interactive ML dashboard for mini-project presentation.

---

## User Review Required

> [!IMPORTANT]
> **Dataset & ML Backend Integration**: The system includes a comprehensive Kaggle-compatible dataset (`anime_dataset.csv`) with top anime, rich metadata (synopsis, genres, score, studio, release year, poster/backdrop URLs, streaming platform links), as well as an ML model training script (`train_model.py`) that exports TF-IDF + Cosine Similarity matrices for fast online API inference.
>
> **Interactive Features**:
> 1. **Personalized Recommender Engine**: Users select watched/favorite anime or select genre tags to receive live ML recommendations with % match metrics and detailed rationale.
> 2. **Streaming Sources & Watch Links**: Direct links and badges for platforms (Crunchyroll, Netflix, Hulu, Disney+, Amazon Prime Video, MyAnimeList) for every title.
> 3. **Interactive ML Showcase / Project Presentation Tab**: Visualizes dataset metrics, TF-IDF vector space analysis, similarity scores, and model explanations for mini-project submission.

---

## Architecture Overview

```
ANIME-RECOMMENDER SYSTEM/
├── backend/                        # Python Machine Learning Backend
│   ├── data/
│   │   └── anime_dataset.csv       # Rich Kaggle-format Anime Dataset
│   ├── models/
│   │   └── recommender_model.pkl   # Serialized TF-IDF Vectorizer & Feature Matrix
│   ├── recommender.py              # ML Engine (TF-IDF, Cosine Similarity, Hybrid Scorer)
│   ├── main.py                     # FastAPI Web Application & API endpoints
│   ├── train_model.py              # ML Model training & pipeline script
│   └── requirements.txt            # Python dependencies (fastapi, uvicorn, pandas, scikit-learn, numpy)
│
└── frontend/                       # React Frontend Web App (Vite + Vanilla CSS Modern Glass UI)
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Header, search, view toggles, history quick drawer
    │   │   ├── HeroBanner.jsx      # Dynamic showcase banner with watch links & play trailer
    │   │   ├── AnimeCard.jsx       # Anime poster, match score %, genres, quick watch buttons
    │   │   ├── AnimeModal.jsx      # Full detail modal: Synopsis, Watch Sources, ML match reasons, Stats
    │   │   ├── PreferencesBar.jsx  # Interactive preference selector (favorite anime / genres)
    │   │   ├── MLStatsDashboard.jsx# Mini-project presentation tab showcasing ML model internals
    │   │   └── HistoryDrawer.jsx   # User's previous choices and watch history
    │   ├── App.jsx                 # Main layout & state management
    │   ├── index.css               # Glassmorphism dark mode theme design system
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Proposed Changes

### Backend (Python Machine Learning)

#### [NEW] [backend/data/anime_dataset.csv](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/backend/data/anime_dataset.csv)
- Kaggle-compliant CSV containing top anime records with fields:
  `anime_id`, `name`, `english_name`, `genres`, `type`, `episodes`, `score`, `scored_by`, `members`, `studio`, `premiered_year`, `synopsis`, `poster_url`, `backdrop_url`, `streaming_sources` (JSON/comma-separated links for Crunchyroll, Netflix, Hulu, etc.), `rating_age`.

#### [NEW] [backend/recommender.py](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/backend/recommender.py)
- `AnimeRecommender` class using `TfidfVectorizer` on combined text features (Genres + Synopsis + Studio + Type + Tags).
- Calculates Cosine Similarity Matrix between all anime.
- `recommend_by_anime_id(anime_id, top_n=10)`: Finds top N similar anime with similarity score breakdown.
- `recommend_by_user_profile(favorite_anime_ids, favorite_genres, top_n=12)`: Builds an aggregated user vector and returns tailored recommendations with % match scores.
- `explain_recommendation(target_id, source_ids)`: Generates natural language explanations (e.g. "95% match due to shared Action, Dark Fantasy genres & Studio Mappa").

#### [NEW] [backend/train_model.py](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/backend/train_model.py)
- Standalone script to clean raw Kaggle dataset, fit TF-IDF vectorizer, extract matrices, evaluate similarity benchmarks, and save pre-computed artifacts to `models/recommender_model.pkl`.

#### [NEW] [backend/main.py](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/backend/main.py)
- FastAPI endpoints:
  - `GET /api/anime`: Paginated & filterable list of anime (search by title, genre, min score, streaming platform).
  - `GET /api/anime/{anime_id}`: Detailed anime profile including streaming links and trailer.
  - `POST /api/recommend/similar`: Get similar anime for a given anime ID.
  - `POST /api/recommend/personalized`: Get custom ML recommendations given user's favorite selections and genre preferences.
  - `GET /api/ml-info`: Provides backend model metrics (vocab size, matrix dimensions, top genre weights) for frontend ML presentation tab.
  - `GET /api/genres`: List of all unique genres with counts.

#### [NEW] [backend/requirements.txt](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/backend/requirements.txt)
- Packages: `fastapi`, `uvicorn`, `pandas`, `scikit-learn`, `numpy`, `python-multipart`.

---

### Frontend (React Web App)

#### [NEW] [frontend/package.json](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/package.json)
- React 18, Lucide React icons, Vite build tool.

#### [NEW] [frontend/src/index.css](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/index.css)
- Premium dark cyber-anime visual theme:
  - Glassmorphic panels (`backdrop-filter: blur(16px)`), deep midnight navy background (`#0B0F19`), neon cyan (`#00F2FE`), vibrant violet (`#7C3AED`), and gold (`#FFB800`) accents.
  - Custom scrollbars, glowing hover cards, animated recommendation match badges, responsive grid layouts.

#### [NEW] [frontend/src/components/Navbar.jsx](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/src/components/Navbar.jsx)
- Brand logo, live search bar, view switcher (Discover / Personalized Feed / ML Model Insights), favorite history counter.

#### [NEW] [frontend/src/components/HeroBanner.jsx](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/src/components/HeroBanner.jsx)
- Featured top anime dynamic slider with background overlay, quick watch links, score badges, and "Add to Favorites" button.

#### [NEW] [frontend/src/components/PreferencesBar.jsx](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/src/components/PreferencesBar.jsx)
- Interactive panel to filter by genres, pick favorite anime from library, adjust minimum score sliders, and trigger instant ML recalculation.

#### [NEW] [frontend/src/components/AnimeCard.jsx](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/src/components/AnimeCard.jsx)
- Anime card component with poster, score, ML Match percentage pill (e.g. 97% Match), watch buttons, hover action overlay.

#### [NEW] [frontend/src/components/AnimeModal.jsx](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/src/components/AnimeModal.jsx)
- Detail modal showing full synopsis, episodes, studio, detailed ML recommendation explanations, and verified streaming source links (Crunchyroll, Netflix, Hulu, Funimation, YouTube, MyAnimeList).

#### [NEW] [frontend/src/components/MLStatsDashboard.jsx](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/frontend/src/components/MLStatsDashboard.jsx)
- Mini-project showcase tab: displays how TF-IDF vectorization works, cosine similarity heatmaps, top feature weights, and ML pipeline architecture diagram.

#### [NEW] [README.md](file:///c:/Users/losha/OneDrive/Documents%20-%20Copy/Documents/ANIME-RECOMMENDER%20SYSTEM/README.md)
- Complete setup and submission documentation explaining the machine learning approach, dataset provenance (Kaggle), backend API endpoints, and step-by-step launch instructions.

---

## Verification Plan

### Automated Verification
- Run Python model training script: `python backend/train_model.py` to confirm TF-IDF & Cosine matrix generation.
- Start FastAPI backend: `uvicorn backend.main:app --port 8000` and verify API endpoints (`/api/anime`, `/api/recommend/personalized`, `/api/ml-info`).
- Build & test React frontend: `npm run build` inside `frontend/` to ensure 0 build/lint errors.

### Manual Verification
- Verify search, genre filter, and score slider responsiveness.
- Select 2-3 favorite anime (e.g., *Attack on Titan*, *Jujutsu Kaisen*) and click "Generate Recommendations" -> confirm high match percentages for similar shonen/dark fantasy titles.
- Click "Watch Now" on an anime card -> verify streaming modal displays direct active links (Crunchyroll, Netflix, Hulu, MAL).
- Toggle "ML Insights" tab -> verify interactive explanation and dataset stats.
