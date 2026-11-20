# CineMatch Anime - AI Recommender System (React + FastAPI ML Backend)

A full-stack, production-ready **Anime Recommender System** built with a **React (Vite) visual frontend** using the **StitchMCP "Cinematic Noir" glassmorphic dark theme design system** and a **Python Machine Learning backend** (FastAPI + Scikit-Learn).

---

## 🌟 Key Features

1. **Content-Based ML Recommender Engine**:
   - Computes high-dimensional **TF-IDF feature vectors** across genres, synopses, studios, and release types.
   - Computes cosine similarity on demand to identify thematic matches.

2. **Personalized User Feed**:
   - Aggregates user's saved favorite anime and genre preferences into a dynamic profile vector.
   - Shows cosine similarity as a match percentage and explains recommendations using the selected titles and genres.

3. **View Anime**
   - A View button on cards, the featured title, and anime details opens a streaming provider in a new tab.
   - The backend retrieves title-specific streaming links from MyAnimeList through Jikan and caches listings for up to an hour. The first listed provider opens automatically. Provider choices are also shown in the detail dialog.
   - Missing provider listings and lookup failures offer platform catalog searches, with retry for failed lookups. Availability depends on location and subscription.

4. **Recommendation Tools in My Picks**
   - Anime Echo finds similar titles from a selected anime.
   - Taste Blend combines selected titles and genres into a preference profile.
   - Story Spark matches a written story description against the catalog using the existing TF-IDF vectors.
   - Each tool runs on submission and supports a minimum score. Model metadata remains available through the backend API.

5. **StitchMCP Cinematic Noir Design System**:
   - Glassmorphic panels (`backdrop-filter: blur(16px)`), deep midnight navy canvas (`#131313`), Netflix action red accents (`#e50914`), cine gold ratings (`#e9c349`), Playfair Display display headlines, and Inter body typography.

---

## 📁 Repository Architecture

```
ANIME-RECOMMENDER SYSTEM/
├── backend/                        # Python Machine Learning Backend
│   ├── data/
│   │   └── anime_dataset.csv       # Local dataset used for optional retraining
│   ├── models/
│   │   └── recommender_model.pkl   # Bundled catalog and TF-IDF vectors
│   ├── recommender.py              # ML Engine (TF-IDF, Cosine Similarity, Explanations)
│   ├── main.py                     # FastAPI Web Server & REST API
│   ├── train_model.py              # Model training & pipeline script
│   └── requirements.txt            # Python dependencies
│
└── frontend/                       # React Frontend Web App (Vite + Glass CSS)
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Header, live search, navigation, saved drawer
    │   │   ├── HeroBanner.jsx      # Spotlight hero slider with watch links & details
    │   │   ├── AnimeCard.jsx       # Poster card with score, match %, genre pills
    │   │   ├── AnimeModal.jsx      # Detail modal: Synopsis, Watch Sources, ML reasons
    │   │   ├── PreferencesBar.jsx  # Interactive preference tuner (favorites & genres)
    │   │   ├── RecommendationTools.jsx # Anime Echo, Taste Blend, Story Spark selector
    │   │   ├── AnimeSeedPicker.jsx # Catalog search for recommendation inputs
    │   │   ├── HistoryDrawer.jsx   # Saved favorites drawer
    │   │   └── PersonalizedFeed.jsx# AI/ML Personalized recommendation feed
    │   ├── App.jsx                 # App state & API integration
    │   ├── index.css               # Cinematic Noir CSS design system
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Launch Instructions

### 1. Start Python ML Backend (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
*API will run at `http://127.0.0.1:8000` with Swagger docs available at `http://127.0.0.1:8000/docs`.*

The bundled model includes the 17,562-title catalog. To retrain it, place the prepared CSV at `backend/data/anime_dataset.csv` and run `python train_model.py` from `backend`.

### 2. Start React Visual Frontend (Vite)
```bash
cd frontend
npm ci
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

Vite proxies `/api` calls to the local FastAPI server. For a deployed frontend, set `VITE_API_URL` to the base URL of the reachable FastAPI server (for example `https://api.example.com`) before building the frontend. For a same-origin deployment that routes `/api` to FastAPI, leave it unset.

### Deploy the full application on Vercel

Use the repository root as the Vercel project's Root Directory. Leave that setting empty, select Vite, and let the root `vercel.json` supply the install command, build command, and `frontend/dist` output directory. Leave `VITE_API_URL` unset so the frontend calls its own `/api` routes.

The `api/index.py` function imports the existing FastAPI app and includes its trained model. The root requirements file installs the backend dependencies with Python 3.13. API rewrites take precedence over the React page fallback, so `/api/anime` returns JSON and page refreshes such as `/personalized` continue to work.

For an existing project configured with Root Directory `frontend`, change it to the repository root and redeploy the latest production commit. A frontend-only deployment requires a separately hosted API configured through `VITE_API_URL`.

---

## 📊 REST API Endpoints

- `GET /api/anime` returns paginated titles filtered by literal title search, score, and genre. Repeat `genre` to match any requested genre, for example `?genre=Action&genre=Fantasy&min_score=8&page=1&limit=24`.
- `GET /api/anime/{id}`: Detailed anime metadata & streaming links.
- `GET /api/anime/{id}/streaming` retrieves streaming providers for the View action using [Jikan's streaming endpoint](https://github.com/jikan-me/jikan-rest/blob/master/storage/api-docs/api-docs.json).
- `POST /api/recommend/similar`: Compute similar anime for a target ID.
- `POST /api/recommend/personalized`: Generate custom recommendations based on user favorites & genres.
- `POST /api/recommend/text` matches a description supplied as `query`, with optional `min_score` and `top_n`.
- `GET /api/ml-info` returns backend model metadata.
- `GET /api/genres`: List of unique genres with frequency counts.
