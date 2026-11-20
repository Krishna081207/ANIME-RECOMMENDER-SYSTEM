import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { animeCatalogPath } from "../api";
import useApiResource from "../hooks/useApiResource";

export default function AnimeSeedPicker({ selected, onChange, multiple = false, favorites = [] }) {
  const [query, setQuery] = useState("");
  const search = useApiResource(
    query.trim() ? animeCatalogPath({ search: query, limit: 12 }) : null,
    { delay: 220 }
  );
  const selectedIds = new Set(selected.map((anime) => anime.anime_id));
  const results = search.data?.data.filter((anime) => !selectedIds.has(anime.anime_id)) || [];

  function select(anime) {
    onChange(multiple ? [...selected, anime] : [anime]);
    setQuery("");
  }

  return (
    <div className="anime-seed-picker">
      {selected.length > 0 && (
        <div className="picks-chips" aria-label="Selected anime">
          {selected.map((anime) => (
            <button
              key={anime.anime_id}
              type="button"
              className="glass-pill"
              aria-label={`Remove ${anime.english_name || anime.name} as a seed`}
              onClick={() => onChange(selected.filter((item) => item.anime_id !== anime.anime_id))}
            >
              {anime.english_name || anime.name} <X size={14} />
            </button>
          ))}
        </div>
      )}
      <label htmlFor="recommendation-seed-title">
        {multiple ? "Add anime you love" : "Choose an anime you love"}
      </label>
      <input
        id="recommendation-seed-title"
        type="search"
        placeholder="Search the anime catalog"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {multiple && favorites.some((anime) => !selectedIds.has(anime.anime_id)) && (
        <button type="button" className="btn-secondary use-library" onClick={() => onChange([
          ...selected, ...favorites.filter((anime) => !selectedIds.has(anime.anime_id))
        ])}>
          <Plus size={15} /> Add saved titles
        </button>
      )}
      {query.trim() && (
        <div className="seed-search-results">
          {search.loading && <p role="status">Searching anime…</p>}
          {search.error && (
            <p role="alert">{search.error} <button type="button" className="btn-secondary" onClick={search.retry}>Retry search</button></p>
          )}
          {search.data && results.length === 0 && <p role="status">No additional titles found.</p>}
          {results.map((anime) => (
            <button key={anime.anime_id} type="button" className="seed-result" onClick={() => select(anime)}>
              <span>{anime.english_name || anime.name}</span>
              {anime.score > 0 && <span>★ {anime.score}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
