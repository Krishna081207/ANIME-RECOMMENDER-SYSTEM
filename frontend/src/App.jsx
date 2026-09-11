import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./index.css";

import { useGenreFilter, useScoreFilter, useSearch } from "./hooks";

import Navbar from "@/components/Navbar";
import DiscoverFeed from "@/components/DiscoverFeed";
import PersonalizedFeed from "@/components/PersonalizedFeed";
import MLInsights from "@/components/MLInsights";
import AnimeModal from "@/components/AnimeModal";
import HistoryDrawer from "@/components/HistoryDrawer";
import MyLibrary from "@/imports/MyLibrary";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Favorites state persisted to localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem("anime_favorites");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal and Drawer states
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Fetch anime dataset on mount
  useEffect(() => {
    async function fetchAnimes() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/anime?limit=500&page=1`);
        if (!res.ok) throw new Error("Failed to fetch anime");
        const data = await res.json();
        const loaded = data.data || [];
        setAnimes(loaded);

        // Seed some default favorites if none exist
        if (favorites.length === 0 && loaded.length > 0) {
          const initialFavorites = loaded.slice(0, 3);
          setFavorites(initialFavorites);
          localStorage.setItem("anime_favorites", JSON.stringify(initialFavorites));
        }
      } catch (e) {
        console.warn("Backend API not reachable, running with empty state:", e);
        setError(e.message);
        setAnimes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAnimes();
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (anime) => {
    if (!anime) return;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.anime_id === anime.anime_id);
      const updated = exists
        ? prev.filter((f) => f.anime_id !== anime.anime_id)
        : [...prev, anime];
      localStorage.setItem("anime_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFavorite = (animeId) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.anime_id !== animeId);
      localStorage.setItem("anime_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const clearFavorites = () => {
    setFavorites([]);
    localStorage.removeItem("anime_favorites");
  };

  const { allGenres, selectedGenres, setSelectedGenres } = useGenreFilter(animes);
  const { minScore, setMinScore } = useScoreFilter(animes);
  const { searchQuery, setSearchQuery } = useSearch(animes);

  const displayed = animes.filter((a) => {
    if (selectedGenres.length > 0) {
      const animeGenres = (a.genres || "").split(",").map((g) => g.trim());
      const hasMatch = selectedGenres.some((g) => animeGenres.includes(g));
      if (!hasMatch) return false;
    }
    const score = parseFloat(a.score) || 0;
    if (score < minScore) return false;
    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      const nameMatch = a.name && a.name.toLowerCase().includes(term);
      const englishMatch = a.english_name && a.english_name.toLowerCase().includes(term);
      if (!nameMatch && !englishMatch) return false;
    }
    return true;
  });

  if (loading && animes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050c06] text-white">
        <div className="text-xl font-medium animate-pulse">Loading anime recommender engine...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050c06] text-white">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        favoritesCount={favorites.length}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <DiscoverFeed
              animes={animes}
              displayedAnimes={displayed}
              allGenres={allGenres}
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}
              minScore={minScore}
              setMinScore={setMinScore}
              onSelectAnime={setSelectedAnime}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          }
        />
        <Route
          path="/personalized"
          element={
            <PersonalizedFeed
              animes={animes}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onSelectAnime={setSelectedAnime}
            />
          }
        />
        <Route
          path="/library"
          element={<MyLibrary />}
        />
        <Route
          path="/ml-insights"
          element={<MLInsights />}
        />
        <Route
          path="*"
          element={
            <DiscoverFeed
              animes={animes}
              displayedAnimes={displayed}
              allGenres={allGenres}
              selectedGenres={selectedGenres}
              setSelectedGenres={setSelectedGenres}
              minScore={minScore}
              setMinScore={setMinScore}
              onSelectAnime={setSelectedAnime}
              onToggleFavorite={toggleFavorite}
              favorites={favorites}
            />
          }
        />
      </Routes>

      {/* Detail Anime Modal */}
      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favorites.some((f) => f.anime_id === selectedAnime.anime_id)}
          onSelectAnime={setSelectedAnime}
          favorites={favorites}
        />
      )}

      {/* Saved Favorites History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        favorites={favorites}
        onRemoveFavorite={removeFavorite}
        onClearFavorites={clearFavorites}
        onSelectAnime={setSelectedAnime}
      />
    </div>
  );
}