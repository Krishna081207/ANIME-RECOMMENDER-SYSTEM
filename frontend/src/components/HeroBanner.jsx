import React from "react";
import { BookmarkPlus, Check, Info, Star } from "lucide-react";

export default function HeroBanner({ anime, onSelect, onToggleFavorite, isFavorite }) {
  const title = anime.english_name || anime.name;
  const art = anime.backdrop_url || anime.poster_url;

  return (
    <section className="catalog-hero" aria-labelledby="featured-anime-title">
      {art && <img src={art} alt="" />}
      <div className="catalog-hero-content">
        <p className="detail-meta">
          {[anime.type, anime.premiered_year || null, anime.studio].filter(Boolean).join(" · ")}
          {anime.score > 0 && <span><Star size={14} fill="currentColor" /> {anime.score} MAL</span>}
        </p>
        <h1 id="featured-anime-title">{title}</h1>
        <p className="hero-synopsis">{anime.synopsis}</p>
        <div className="picks-toolbar-actions">
          <button className="btn-primary" onClick={() => onSelect(anime)}>
            <Info size={17} /> View details
          </button>
          <button className={isFavorite ? "btn-gold" : "btn-secondary"} aria-pressed={isFavorite} onClick={() => onToggleFavorite(anime)}>
            {isFavorite ? <Check size={17} /> : <BookmarkPlus size={17} />}
            {isFavorite ? "Saved" : "Save anime"}
          </button>
        </div>
      </div>
    </section>
  );
}
