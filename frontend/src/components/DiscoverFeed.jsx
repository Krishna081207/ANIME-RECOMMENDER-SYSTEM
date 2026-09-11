import React from "react";
import AnimeCard from "./AnimeCard";
import HeroBanner from "./HeroBanner";
import PreferencesBar from "./PreferencesBar";

export default function DiscoverFeed({
  animes = [],
  displayedAnimes,
  allGenres = [],
  selectedGenres = [],
  setSelectedGenres,
  minScore = 0,
  setMinScore,
  onSelectAnime,
  onToggleFavorite,
  favorites = []
}) {
  const toggleGenre = (genre) => {
    if (typeof setSelectedGenres === "function") {
      setSelectedGenres((prev) =>
        prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
      );
    }
  };

  const handleReset = () => {
    if (typeof setSelectedGenres === "function") setSelectedGenres([]);
    if (typeof setMinScore === "function") setMinScore(0);
  };

  const displayed = displayedAnimes !== undefined ? displayedAnimes : animes;
  const featuredAnime = displayed.length > 0 ? displayed[0] : (animes.length > 0 ? animes[0] : null);

  return (
    <div className="min-h-screen bg-[#050c06] overflow-x-hidden">
      {/* Hero Banner Section */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 24px 0 24px" }}>
        {featuredAnime && (
          <HeroBanner
            anime={featuredAnime}
            onSelect={onSelectAnime}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favorites.some((f) => f.anime_id === featuredAnime.anime_id)}
          />
        )}
      </div>

      {/* Filters & Preferences Bar */}
      <div style={{ padding: "10px 24px", maxWidth: "1400px", margin: "0 auto" }}>
        <PreferencesBar
          genres={allGenres.slice(0, 16)}
          selectedGenres={selectedGenres}
          onToggleGenre={toggleGenre}
          minScore={minScore}
          setMinScore={setMinScore}
          favoriteAnimeList={favorites}
          onRemoveFavorite={(id) => {
            const item = favorites.find((f) => f.anime_id === id);
            if (item) onToggleFavorite(item);
          }}
          onRecalculate={() => {}}
          onReset={handleReset}
        />
      </div>

      {/* Anime Grid */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px 24px 60px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "24px",
        }}
      >
        {displayed.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "80px 20px",
              color: "var(--text-muted)",
            }}
          >
            <i className="bi bi-film-half" style={{ fontSize: "48px", color: "var(--glass-border)", marginBottom: "16px" }} />
            <h3 style={{ color: "#ffffff", marginBottom: "8px" }}>No anime found</h3>
            <p style={{ color: "var(--text-secondary)" }}>Try adjusting your filters or search.</p>
          </div>
        ) : (
          displayed.map((anime) => (
            <AnimeCard
              key={anime.anime_id}
              anime={anime}
              onSelect={onSelectAnime}
              onToggleFavorite={onToggleFavorite}
              isFavorite={favorites.some((f) => f.anime_id === anime.anime_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}