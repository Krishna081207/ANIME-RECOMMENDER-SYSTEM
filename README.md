# CineMatch Anime - AI Recommender System (React + FastAPI ML Backend)

A full-stack, production-ready **Anime Recommender System** built with a **React (Vite) visual frontend** using the **StitchMCP "Cinematic Noir" glassmorphic dark theme design system** and a **Python Machine Learning backend** (FastAPI + Scikit-Learn).

---

## 🌟 Key Features

1. **Content-Based ML Recommender Engine**:
   - Computes high-dimensional **TF-IDF feature vectors** across genres, synopses, studios, and release types.
   - Calculates a **Cosine Similarity Matrix** to identify thematic matches.

2. **Personalized User Feed**:
   - Aggregates user's saved favorite anime and genre preferences into a dynamic profile vector.
   - Generates real-time match percentages (e.g. `97.4% Match`) and natural language explanations (e.g. *"95% match due to shared Action, Dark Fantasy genres & Studio MAPPA"*).

3. **Official Streaming Platform Links**:
   - Provides direct badges and links for verified streaming sources (**Crunchyroll, Netflix, Hulu, Disney+, Max, MyAnimeList**) for every anime title.

4. **Mini-Project Presentation / ML Insights Tab**:
   - Live dashboard detailing dataset metrics, vector space vocabulary size, matrix shapes, genre distribution charts, and end-to-end ML pipeline architecture.

5. **StitchMCP Cinematic Noir Design System**:
   - Glassmorphic panels (`backdrop-filter: blur(16px)`), deep midnight navy canvas (`#131313`), Netflix action red accents (`#e50914`), cine gold ratings (`#e9c349`), Playfair Display display headlines, and Inter body typography.

---

## 📁 Repository Architecture

```
ANIME-RECOMMENDER SYSTEM/
├── backend/                        # Python Machine Learning Backend
│   ├── data/
│   │   └── anime_dataset.csv       # Kaggle-compliant Anime Dataset (30 titles)
│   ├── models/
│   │   └── recommender_model.pkl   # Pre-computed TF-IDF & Cosine Matrix Artifacts
│   ├── recommender.py              # ML Engine (TF-IDF, Cosine Similarity, Explanations)
│   ├── main.py                     # FastAPI Web Server & REST API
│   ├── train_model.py              # Model training & pipeline script
│   └── requirements.txt            # Python dependencies
│
└── frontend/                       # React Frontend Web App (Vite + Glass CSS)
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Header, live search, view tabs, saved drawer
    │   │   ├── HeroBanner.jsx      # Spotlight hero slider with watch links & trailer
    │   │   ├── AnimeCard.jsx       # Poster card with score, match %, genre pills
    │   │   ├── AnimeModal.jsx      # Detail modal: Synopsis, Watch Sources, ML reasons
    │   │   ├── PreferencesBar.jsx  # Interactive preference tuner (favorites & genres)
    │   │   ├── MLStatsDashboard.jsx# Mini-project presentation tab showcasing ML internals
    │   │   └── HistoryDrawer.jsx   # Saved favorites drawer
    │   ├── App.jsx                 # App state & API integration
    │   ├── index.css               # StitchMCP Cinematic Noir CSS design system
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🚀 Quick Launch Instructions

### 1. Start Python ML Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python train_model.py
python main.py
```
*API will run at `http://127.0.0.1:8000` with Swagger docs available at `http://127.0.0.1:8000/docs`.*

### 2. Start React Visual Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

---

## 📊 REST API Endpoints

- `GET /api/anime`: Paginated & filterable list of anime (`?search=attack&genre=Action&min_score=8.5`).
- `GET /api/anime/{id}`: Detailed anime metadata & streaming links.
- `POST /api/recommend/similar`: Compute similar anime for a target ID.
- `POST /api/recommend/personalized`: Generate custom recommendations based on user favorites & genres.
- `GET /api/ml-info`: Return vocabulary metrics and matrix shapes for presentation.
- `GET /api/genres`: List of unique genres with frequency counts.
