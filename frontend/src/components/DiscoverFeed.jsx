import React, { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import HeroBanner from "./HeroBanner";
import PreferencesBar from "./PreferencesBar";
import { animeCatalogPath } from "../api";
import useApiResource from "../hooks/useApiResource";

export default function DiscoverFeed({
  genres, searchQuery, onResetSearch, page, setPage, selectedGenres, setSelectedGenres, minScore, setMinScore,
  favorites, onRemoveFavorite, onToggleFavorite, onSelectAnime
}) {
  const results = useRef(null);
  const catalog = useApiResource(
    animeCatalogPath({ search: searchQuery, genres: selectedGenres, minScore, page }),
    { delay: 220 }
  );

  function toggleGenre(genre) {
    setSelectedGenres((previous) => (
      previous.includes(genre) ? previous.filter((item) => item !== genre) : [...previous, genre]
    ));
    setPage(1);
  }

  function updateScore(score) {
    setMinScore(score);
    setPage(1);
  }

  function resetFilters() {
    setSelectedGenres([]);
    setMinScore(0);
    onResetSearch();
  }

  function changePage(nextPage) {
    setPage(nextPage);
    results.current.focus();
  }

  const items = catalog.data?.data || [];
  const total = catalog.data?.total_count || 0;
  const limit = catalog.data?.limit || 24;
  const pageCount = Math.ceil(total / limit);
  const isFiltered = Boolean(searchQuery.trim() || selectedGenres.length || minScore);
  const featured = page === 1 && !isFiltered ? items[0] : null;

  return (
    <main className="anime-page">
      {featured && (
        <HeroBanner
          anime={featured}
          onSelect={onSelectAnime}
          onToggleFavorite={onToggleFavorite}
          isFavorite={favorites.some((anime) => anime.anime_id === featured.anime_id)}
        />
      )}

      <PreferencesBar
        genres={genres.data?.genres || []}
        selectedGenres={selectedGenres}
        onToggleGenre={toggleGenre}
        minScore={minScore}
        setMinScore={updateScore}
        favoriteAnimeList={favorites}
        onRemoveFavorite={onRemoveFavorite}
        onReset={resetFilters}
      />
      {genres.error && (
        <p className="anime-inline-error" role="alert">
          Genre filters are unavailable. <button className="btn-secondary" onClick={genres.retry}>Retry genres</button>
        </p>
      )}

      <section className="catalog-results" aria-label="Catalog results" tabIndex={-1} ref={results}>
      {catalog.loading ? (
        <p className="anime-status" role="status">Loading anime…</p>
      ) : catalog.error ? (
        <div className="anime-status" role="alert">
          <h2>Could not load the catalog</h2>
          <p>{catalog.error}</p>
          <button className="btn-secondary" onClick={catalog.retry}>Retry catalog</button>
        </div>
      ) : items.length === 0 ? (
        <div className="anime-status">
          <h2>No anime found</h2>
          <p>Try adjusting your filters or search.</p>
        </div>
      ) : (
        <>
          <p className="catalog-count" role="status">
            {(1 + (page - 1) * limit).toLocaleString()}–{((page - 1) * limit + items.length).toLocaleString()} of {total.toLocaleString()} titles
          </p>
          <div className="anime-list-grid">
            {items.map((anime) => (
              <AnimeCard
                key={anime.anime_id}
                anime={anime}
                onSelect={onSelectAnime}
                onToggleFavorite={onToggleFavorite}
                isFavorite={favorites.some((item) => item.anime_id === anime.anime_id)}
              />
            ))}
          </div>
          {pageCount > 1 && (
            <nav className="catalog-pagination" aria-label="Catalog pages">
              <button className="btn-secondary" disabled={page === 1} onClick={() => changePage(page - 1)}>
                <ArrowLeft size={16} /> Previous
              </button>
              <span>Page {page} of {pageCount}</span>
              <button className="btn-secondary" disabled={page === pageCount} onClick={() => changePage(page + 1)}>
                Next <ArrowRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
      </section>
    </main>
  );
}
