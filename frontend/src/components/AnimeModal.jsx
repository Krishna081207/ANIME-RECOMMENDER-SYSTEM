import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Star, Play, Sparkles, Building2, Calendar, Film, BookmarkPlus, Check } from 'lucide-react';
import AnimeCard from './AnimeCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function AnimeModal({ anime, onClose, onToggleFavorite, isFavorite, onSelectAnime }) {
  const [similarAnime, setSimilarAnime] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (!anime) return;
    fetchSimilar(anime.anime_id);
  }, [anime]);

  const fetchSimilar = async (id) => {
    setLoadingSimilar(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend/similar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anime_id: id, top_n: 4 })
      });
      const data = await res.json();
      setSimilarAnime(data.recommendations || []);
    } catch (e) {
      console.error("Failed to fetch similar anime", e);
    } finally {
      setLoadingSimilar(false);
    }
  };

  if (!anime) return null;

  const streamingSources = Array.isArray(anime.streaming_sources) 
    ? anime.streaming_sources 
    : [];

  const genres = anime.genres ? anime.genres.split(',').map(g => g.trim()) : [];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Modal Container */}
      <div 
        className="glass-panel-dense fade-in"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--glass-border)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            zIndex: 30,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(19, 19, 19, 0.8)',
            border: '1px solid var(--glass-border)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Backdrop Banner */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '280px',
          overflow: 'hidden'
        }}>
          <img 
            src={anime.backdrop_url || anime.poster_url} 
            alt={anime.name} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.55)'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #141313 0%, transparent 100%)'
          }} />

          {/* Title Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '24px',
            right: '24px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '20px'
          }}>
            <img 
              src={anime.poster_url} 
              alt={anime.name}
              style={{
                width: '120px',
                height: '170px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'block'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  background: 'var(--primary-red)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {anime.type} ({anime.episodes} EPS)
                </span>
                <span style={{
                  color: 'var(--secondary-gold)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Star size={14} fill="currentColor" /> {anime.score} / 10 MAL
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.15
              }}>
                {anime.english_name || anime.name}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{anime.name}</p>
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div style={{ padding: '28px' }}>
          {/* Action Row & Streaming Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '20px',
            marginBottom: '20px',
            borderBottom: '1px solid var(--glass-border)'
          }}>
            {/* Watch Sources */}
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                OFFICIAL STREAMING SOURCES
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {streamingSources.length > 0 ? (
                  streamingSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    >
                      <Play size={14} fill="currentColor" /> {src.name} <ExternalLink size={12} />
                    </a>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available on Crunchyroll & Netflix</span>
                )}
              </div>
            </div>

            {/* Favorite Action */}
            <button
              onClick={() => onToggleFavorite(anime)}
              className={isFavorite ? "btn-gold" : "btn-secondary"}
              style={{ padding: '10px 20px' }}
            >
              {isFavorite ? <Check size={18} /> : <BookmarkPlus size={18} />}
              {isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}
            </button>
          </div>

          {/* ML Match Explanation Box if available */}
          {anime.explanation && (
            <div style={{
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Sparkles size={20} color="#00f2fe" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <h4 style={{ color: '#00f2fe', fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px' }}>
                  ML Engine Recommendation Rationale ({anime.match_percentage || '95'}% Match)
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {anime.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Synopsis */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
              Synopsis
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {anime.synopsis}
            </p>
          </div>

          {/* Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STUDIO</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{anime.studio}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RELEASE YEAR</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{anime.premiered_year}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RATING</span>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{anime.rating_age || 'R - 17+'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GENRES</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {genres.map((g, i) => (
                  <span key={i} className="glass-pill" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Similar ML Recommendations Section */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary-red)" /> Similar ML Match Recommendations
            </h3>

            {loadingSimilar ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Calculating TF-IDF similarity matrix vectors...</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                {similarAnime.map((rec) => (
                  <AnimeCard
                    key={rec.anime_id}
                    anime={rec}
                    onSelect={(a) => {
                      onSelectAnime(a);
                    }}
                    onToggleFavorite={onToggleFavorite}
                    isFavorite={isFavorite(rec.anime_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
