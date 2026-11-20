import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";

import Navbar from "@/components/Navbar";
import DiscoverFeed from "@/components/DiscoverFeed";
import PersonalizedFeed from "@/components/PersonalizedFeed";
import AnimeCard from "@/components/AnimeCard";
import AnimeModal from "@/components/AnimeModal";
import HistoryDrawer from "@/components/HistoryDrawer";
import WatchPage from "@/components/WatchPage";
import useApiResource from "@/hooks/useApiResource";

const FAVORITES_KEY = "anime_favorites";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minScore, setMinScore] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY));
      return Array.isArray(stored) ? stored.filter((item) => Number.isInteger(item?.anime_id)) : [];
    } catch {
      return [];
    }
  });
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const genres = useApiResource("/api/genres");

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [favorites]);

  function toggleFavorite(anime) {
    const { match_percentage, explanation, ...savedAnime } = anime;
    setFavorites((previous) => (
      previous.some((item) => item.anime_id === anime.anime_id)
        ? previous.filter((item) => item.anime_id !== anime.anime_id)
        : [...previous, savedAnime]
    ));
  }

  function removeFavorite(animeId) {
    setFavorites((previous) => previous.filter((anime) => anime.anime_id !== animeId));
  }

  function updateSearch(query) {
    setSearchQuery(query);
    setPage(1);
  }

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={updateSearch}
        favoritesCount={favorites.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <Routes>
        <Route path="/watch/:animeId" element={<WatchPage />} />
        <Route path="/personalized" element={
          <PersonalizedFeed
            allGenres={genres.data?.genres}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onSelectAnime={setSelectedAnime}
          />
        } />
        <Route path="/library" element={
          <main className="anime-page">
            <div className="library-heading">
              <h1>My Library</h1>
              <span>{favorites.length} saved</span>
            </div>
            {favorites.length > 0 ? (
              <div className="anime-list-grid">
                {favorites.map((anime) => (
                  <AnimeCard
                    key={anime.anime_id}
                    anime={anime}
                    onSelect={setSelectedAnime}
                    onToggleFavorite={toggleFavorite}
                    isFavorite
                  />
                ))}
              </div>
            ) : (
              <div className="anime-status">
                <h2>No saved anime yet</h2>
                <p>Bookmark titles to find them here and use them in My Picks.</p>
                <Link to="/" className="btn-secondary">Discover anime</Link>
              </div>
            )}
          </main>
        } />
        <Route path="/ml-insights" element={<Navigate to="/personalized" replace />} />
        <Route path="*" element={
          <DiscoverFeed
            genres={genres}
            searchQuery={searchQuery}
            onResetSearch={() => updateSearch("")}
            selectedGenres={selectedGenres}
            setSelectedGenres={setSelectedGenres}
            minScore={minScore}
            setMinScore={setMinScore}
            page={page}
            setPage={setPage}
            favorites={favorites}
            onRemoveFavorite={removeFavorite}
            onToggleFavorite={toggleFavorite}
            onSelectAnime={setSelectedAnime}
          />
        } />
      </Routes>

      {selectedAnime && (
        <AnimeModal
          key={selectedAnime.anime_id}
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          onToggleFavorite={toggleFavorite}
          onSelectAnime={setSelectedAnime}
          favorites={favorites}
        />
      )}

      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        favorites={favorites}
        onRemoveFavorite={removeFavorite}
        onClearFavorites={() => setFavorites([])}
        onSelectAnime={(anime) => {
          setHistoryOpen(false);
          setSelectedAnime(anime);
        }}
      />
    </>
  );
}
