import React, { useEffect, useRef } from "react";
import { BookmarkPlus, Check, ExternalLink, Sparkles, Star, X } from "lucide-react";
import AnimeCard from "./AnimeCard";
import useApiResource from "../hooks/useApiResource";
import ViewAnimeLink from "./ViewAnimeLink";

export default function AnimeModal({ anime, onClose, onToggleFavorite, onSelectAnime, favorites }) {
  const dialog = useRef(null);
  const details = useApiResource(`/api/anime/${anime.anime_id}`);
  const availability = useApiResource(`/api/anime/${anime.anime_id}/streaming`);
  const similar = useApiResource("/api/recommend/similar", {
    body: JSON.stringify({ anime_id: anime.anime_id, top_n: 4 })
  });

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  const item = { ...anime, ...details.data };
  const title = item.english_name || item.name;
  const savedIds = new Set(favorites.map((favorite) => favorite.anime_id));
  const isSaved = savedIds.has(item.anime_id);
  const genres = item.genres?.split(",").map((genre) => genre.trim()).filter(Boolean) || [];
  const sources = availability.data?.sources || [];
  const recommendations = similar.data?.recommendations || [];

  return (
    <dialog
      ref={dialog}
      className="anime-detail glass-panel-dense"
      aria-labelledby="anime-details-title"
      onCancel={onClose}
      onClick={(event) => { if (event.target === dialog.current) onClose(); }}
    >
      <div className="anime-detail-content">
        <button className="btn-secondary detail-close" aria-label="Close anime details" onClick={onClose} autoFocus>
          <X size={20} />
        </button>

        <div className="anime-detail-layout">
          <div className="detail-poster">
            <img src={item.poster_url} alt="" />
            <ViewAnimeLink anime={item} />
            <button className={isSaved ? "btn-gold" : "btn-secondary"} aria-pressed={isSaved} onClick={() => onToggleFavorite(item)}>
              {isSaved ? <Check size={17} /> : <BookmarkPlus size={17} />}
              {isSaved ? "Saved to My Library" : "Save to My Library"}
            </button>
          </div>

          <div className="detail-info">
            <div>
              <div className="detail-meta">
                {[item.type, item.premiered_year || null, item.studio].filter(Boolean).join(" · ")}
                {item.score > 0 && <span><Star size={14} fill="currentColor" /> {item.score} MAL</span>}
              </div>
              <h2 id="anime-details-title">{title}</h2>
              {item.name !== title && <p className="picks-hint">{item.name}</p>}
            </div>
            <div className="picks-chips">
              {genres.map((genre) => <span className="glass-pill" key={genre}>{genre}</span>)}
            </div>

            {details.error && (
              <p className="anime-inline-error" role="alert">
                Details could not be refreshed. <button className="btn-secondary" onClick={details.retry}>Retry details</button>
              </p>
            )}
            <section className="detail-section">
              <h3>Synopsis</h3>
              <p>{item.synopsis || "No synopsis available."}</p>
            </section>

            {item.explanation && (
              <section className="detail-section match-explanation">
                <h3><Sparkles size={16} /> {Number.isFinite(item.match_percentage) ? `${item.match_percentage}% match` : "Why it was recommended"}</h3>
                <p>{item.explanation}</p>
              </section>
            )}

            <section className="detail-section">
              <h3>Where to watch</h3>
              {availability.loading ? (
                <p role="status">Checking streaming providers…</p>
              ) : availability.error ? (
                <p>{availability.error} <button className="btn-secondary" onClick={availability.retry}>Retry availability</button></p>
              ) : sources.length ? (
                <div className="picks-chips">
                  {sources.map((source) => (
                    <a className="btn-secondary" key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                      View on {source.name} <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              ) : (
                <p>No streaming provider is listed for this title.</p>
              )}
              <p className="picks-hint">Availability depends on your location and subscription.</p>
            </section>

            <section className="detail-section">
              <h3>Similar anime</h3>
              {similar.loading ? (
                <p role="status">Finding similar titles…</p>
              ) : similar.error ? (
                <p role="alert">{similar.error} <button className="btn-secondary" onClick={similar.retry}>Retry similar anime</button></p>
              ) : recommendations.length === 0 ? (
                <p>No similar titles found.</p>
              ) : (
                <div className="anime-list-grid similar-grid">
                  {recommendations.map((anime) => (
                    <AnimeCard
                      key={anime.anime_id}
                      anime={anime}
                      onSelect={onSelectAnime}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={savedIds.has(anime.anime_id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </dialog>
  );
}
