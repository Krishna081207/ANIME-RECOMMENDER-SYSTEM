import React from "react";
import { BookmarkPlus, Check, Sparkles, Star } from "lucide-react";
import ViewAnimeLink from "./ViewAnimeLink";

export default function AnimeCard({ anime, onSelect, onToggleFavorite, isFavorite }) {
  const title = anime.english_name || anime.name;
  const genres = anime.genres?.split(",").map((genre) => genre.trim()).filter(Boolean) || [];

  return (
    <article className="anime-card glass-panel">
      <div className="anime-card-poster">
        {anime.poster_url && <img src={anime.poster_url} alt="" loading="lazy" />}
        {Number.isFinite(anime.match_percentage) && (
          <span className="card-match"><Sparkles size={13} /> {anime.match_percentage}% match</span>
        )}
        {anime.score > 0 && (
          <span className="card-score"><Star size={13} fill="currentColor" /> {anime.score}</span>
        )}
        <button
          className="card-bookmark"
          aria-label={`${isFavorite ? "Remove" : "Save"} ${title}`}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(anime)}
        >
          {isFavorite ? <Check size={18} /> : <BookmarkPlus size={18} />}
        </button>
      </div>
      <div className="anime-card-content">
        <h3><button className="anime-card-open" onClick={() => onSelect(anime)}>{title}</button></h3>
        <p className="picks-hint">{[anime.type, anime.premiered_year || null, anime.studio].filter(Boolean).join(" · ")}</p>
        {genres.length > 0 && (
          <div className="picks-chips">
            {genres.slice(0, 3).map((genre) => <span key={genre} className="glass-pill">{genre}</span>)}
          </div>
        )}
        {anime.explanation && <p className="card-explanation">{anime.explanation}</p>}
      </div>
      <div className="anime-card-actions">
        <ViewAnimeLink anime={anime} />
      </div>
    </article>
  );
}
