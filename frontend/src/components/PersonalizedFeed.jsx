import React, { useState, useEffect } from "react";
import { Sparkles, SlidersHorizontal, RotateCcw, Filter, Star, Check, X, Film, Info } from "lucide-react";
import AnimeCard from "./AnimeCard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const POPULAR_GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Drama", "Fantasy",
  "Sci-Fi", "Mystery", "Supernatural", "Psychological", "Romance",
  "Thriller", "Horror", "Shounen", "Slice of Life", "Sports"
];

export default function PersonalizedFeed({
  animes = [],
  favorites = [],
  onToggleFavorite,
  onSelectAnime,
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Preference state
  const [seedFavorites, setSeedFavorites] = useState(favorites);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minScore, setMinScore] = useState(7.0);
  const [seedSearch, setSeedSearch] = useState("");
  const [showAddSeedModal, setShowAddSeedModal] = useState(false);

  // Synchronize when incoming favorites change initially
  useEffect(() => {
    if (favorites.length > 0 && seedFavorites.length === 0) {
      setSeedFavorites(favorites);
    }
  }, [favorites]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const favIds = seedFavorites.map((f) => f.anime_id);
      const res = await fetch(`${API_BASE_URL}/api/recommend/personalized`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favorite_ids: favIds,
          favorite_genres: selectedGenres,
          min_score: minScore,
          top_n: 18,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.warn("Error loading personalized recommendations:", e);
      setError("Unable to connect to ML recommender API. Showing local fallback scoring.");
      // Local fallback calculation
      computeLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const computeLocalFallback = () => {
    const favGenres = new Set(
      seedFavorites.flatMap((f) => (f.genres || "").split(",").map((g) => g.trim())).concat(selectedGenres)
    );
    const favIds = new Set(seedFavorites.map((f) => f.anime_id));

    const scored = animes
      .filter((a) => !favIds.has(a.anime_id) && (parseFloat(a.score) || 0) >= minScore)
      .map((a) => {
        const itemGenres = (a.genres || "").split(",").map((g) => g.trim());
        const matchCount = itemGenres.filter((g) => favGenres.has(g)).length;
        const baseScore = parseFloat(a.score) || 0;
        const matchPct = Math.min(99.2, Math.round(60 + matchCount * 9 + baseScore * 2));
        return {
          ...a,
          match_percentage: matchPct,
          explanation: matchCount > 0
            ? `${matchPct}% match based on matching ${itemGenres.slice(0, 2).join(", ")} themes.`
            : `${matchPct}% match based on high community score.`,
        };
      })
      .sort((a, b) => b.match_percentage - a.match_percentage)
      .slice(0, 18);

    setRecommendations(scored);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [seedFavorites.length, selectedGenres.length, minScore]);

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const removeSeed = (animeId) => {
    setSeedFavorites((prev) => prev.filter((a) => a.anime_id !== animeId));
  };

  const addSeed = (anime) => {
    if (!seedFavorites.some((f) => f.anime_id === anime.anime_id)) {
      setSeedFavorites((prev) => [...prev, anime]);
    }
    setShowAddSeedModal(false);
    setSeedSearch("");
  };

  const handleReset = () => {
    setSeedFavorites([]);
    setSelectedGenres([]);
    setMinScore(7.0);
  };

  const searchResults = seedSearch
    ? animes
        .filter((a) =>
          (a.name && a.name.toLowerCase().includes(seedSearch.toLowerCase())) ||
          (a.english_name && a.english_name.toLowerCase().includes(seedSearch.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  return (
    <div className="min-h-screen bg-[#050c06] overflow-x-hidden">
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 24px 80px 24px" }}>
        {/* Header Title */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(0, 242, 254, 0.12)", border: "1px solid rgba(0, 242, 254, 0.3)", borderRadius: "var(--radius-full)", padding: "4px 14px", marginBottom: "12px" }}>
            <Sparkles size={16} color="#00f2fe" />
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#00f2fe", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Machine Learning Vector Inference Engine
            </span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.4rem", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
            Your Personalized Anime Recommendations
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "800px" }}>
            Our Content-Based TF-IDF and Cosine Vector model analyzes thematic synopses, studios, and genres from your selected library to synthesize tailored recommendations with real-time match explanations.
          </p>
        </div>

        {/* Preference Tuner Panel */}
        <div className="glass-panel" style={{ padding: "24px", marginBottom: "36px", border: "1px solid var(--glass-border)", borderRadius: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <SlidersHorizontal size={22} color="var(--secondary-gold)" />
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Tune Your Recommendation Profile
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button onClick={handleReset} className="btn-secondary" style={{ padding: "8px 14px", fontSize: "0.82rem" }}>
                <RotateCcw size={14} /> Reset
              </button>
              <button onClick={fetchRecommendations} className="btn-gold" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
                <Sparkles size={16} /> Re-Calculate ML Matches
              </button>
            </div>
          </div>

          {/* Seed Anime List */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Seed Anime Titles ({seedFavorites.length} Active):
              </span>
              <button
                onClick={() => setShowAddSeedModal(true)}
                style={{ background: "rgba(229, 9, 20, 0.15)", border: "1px solid rgba(229, 9, 20, 0.4)", color: "#ff8585", borderRadius: "999px", padding: "3px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
              >
                + Add Seed Anime
              </button>
            </div>

            {seedFavorites.length === 0 ? (
              <div style={{ padding: "12px 16px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px", color: "var(--text-muted)", fontSize: "0.86rem" }}>
                No seed anime selected yet. Click <strong>+ Add Seed Anime</strong> or bookmark anime from the Discover page to guide the model.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {seedFavorites.map((a) => (
                  <span
                    key={a.anime_id}
                    style={{
                      background: "rgba(233, 195, 73, 0.15)",
                      border: "1px solid rgba(233, 195, 73, 0.4)",
                      color: "var(--secondary-gold)",
                      borderRadius: "var(--radius-full)",
                      padding: "5px 14px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {a.english_name || a.name}
                    <X
                      size={14}
                      style={{ cursor: "pointer", opacity: 0.8 }}
                      onClick={() => removeSeed(a.anime_id)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add Seed Search Dropdown Modal */}
          {showAddSeedModal && (
            <div style={{ padding: "14px", background: "rgba(0, 0, 0, 0.6)", borderRadius: "12px", border: "1px solid var(--glass-border)", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#ffffff" }}>Search anime to add as recommendation seed:</span>
                <X size={18} style={{ cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setShowAddSeedModal(false)} />
              </div>
              <input
                type="text"
                placeholder="Type title (e.g. Death Note, Demon Slayer, Naruto)..."
                value={seedSearch}
                onChange={(e) => setSeedSearch(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  outline: "none",
                  marginBottom: "10px",
                }}
              />
              {searchResults.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {searchResults.map((a) => (
                    <div
                      key={a.anime_id}
                      onClick={() => addSeed(a)}
                      style={{
                        padding: "8px 12px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(229, 9, 20, 0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)")}
                    >
                      <span style={{ fontSize: "0.88rem", color: "#ffffff", fontWeight: 600 }}>{a.english_name || a.name}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--secondary-gold)" }}>★ {a.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preferred Genres Selection */}
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
              Preferred Genres:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {POPULAR_GENRES.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    style={{
                      background: isSelected ? "#334a6d" : "#1a221a",
                      color: isSelected ? "#a2b9e2" : "#dce5d9",
                      border: isSelected ? "1px solid #4a6fa5" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "9999px",
                      padding: "5px 14px",
                      fontSize: "0.8rem",
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Score Slider */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(0, 0, 0, 0.2)", padding: "12px 18px", borderRadius: "var(--radius-md)" }}>
            <Filter size={16} color="var(--text-muted)" />
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minWidth: "150px" }}>
              Minimum Score: <strong>{minScore.toFixed(1)}+ MAL</strong>
            </span>
            <input
              type="range"
              min="0"
              max="9.5"
              step="0.5"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              style={{ flexGrow: 1, accentColor: "var(--primary-red)", cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div style={{ padding: "12px 18px", background: "rgba(255, 77, 77, 0.15)", border: "1px solid rgba(255, 77, 77, 0.3)", borderRadius: "10px", color: "#ff8585", marginBottom: "24px", fontSize: "0.88rem" }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
            <Sparkles size={44} style={{ color: "#00f2fe", marginBottom: "16px", animation: "spin 2s linear infinite" }} />
            <h3 style={{ color: "#ffffff", marginBottom: "8px" }}>Calculating ML Vectors...</h3>
            <p style={{ color: "var(--text-secondary)" }}>Synthesizing cosine distance and thematic matches across 17,000+ anime titles.</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
            <Film size={48} style={{ opacity: 0.3, marginBottom: "16px" }} />
            <h3 style={{ color: "#ffffff", marginBottom: "8px" }}>No matching anime found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try lowering the minimum score threshold or selecting different genres.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "24px",
            }}
          >
            {recommendations.map((anime) => (
              <AnimeCard
                key={anime.anime_id}
                anime={anime}
                onSelect={onSelectAnime}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.some((f) => f.anime_id === anime.anime_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}