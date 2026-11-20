import React from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Sparkles, X } from "lucide-react";

export default function PreferencesBar({
  genres, selectedGenres, onToggleGenre, minScore, setMinScore,
  favoriteAnimeList, onRemoveFavorite, onReset
}) {
  return (
    <section className="glass-panel picks-preferences" aria-labelledby="catalog-filters-heading">
      <div className="picks-toolbar">
        <h2 id="catalog-filters-heading">Catalog filters</h2>
        <div className="picks-toolbar-actions">
          <button className="btn-secondary" onClick={onReset}>
            <RotateCcw size={16} /> Reset filters
          </button>
          <Link to="/personalized" state={{ genres: selectedGenres, minScore }} className="btn-gold">
            <Sparkles size={16} /> Get recommendations
          </Link>
        </div>
      </div>

      {favoriteAnimeList.length > 0 && (
        <div>
          <h3>Saved titles</h3>
          <div className="picks-chips">
            {favoriteAnimeList.map((anime) => (
              <button
                type="button"
                key={anime.anime_id}
                className="glass-pill"
                aria-label={`Remove ${anime.english_name || anime.name} from saved titles`}
                onClick={() => onRemoveFavorite(anime.anime_id)}
              >
                {anime.english_name || anime.name} <X size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      {genres.length > 0 && (
        <div>
          <h3>Genres</h3>
          <div className="picks-chips">
            {genres.map((genre) => (
              <button
                type="button"
                key={genre}
                className="glass-pill"
                aria-pressed={selectedGenres.includes(genre)}
                onClick={() => onToggleGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="score-filter">
        <span>Minimum score <strong>{minScore.toFixed(1)}+</strong></span>
        <input type="range" min="0" max="10" step="0.5" value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} />
      </label>
    </section>
  );
}
