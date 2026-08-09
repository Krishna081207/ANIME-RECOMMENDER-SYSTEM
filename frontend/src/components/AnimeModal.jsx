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
          maxWidth: '1180px',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
          borderRadius: '24px',
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

        <div style={{ padding: '28px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 360px) minmax(0, 1fr)',
            gap: '28px',
            alignItems: 'start'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'sticky',
                top: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '16px'
              }}>
                <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                  <img
                    src={anime.poster_url}
                    alt={anime.name}
                    style={{ width: '100%', display: 'block', aspectRatio: '2 / 3', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(19,19,19,0.88), transparent 45%)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    right: '14px',
                    bottom: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                    alignItems: 'end'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'var(--primary-red)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                          {anime.type} · {anime.episodes} EPS
                        </span>
                        <span style={{ color: 'var(--secondary-gold)', fontWeight: 700, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} fill="currentColor" /> {anime.score} / 10
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.9rem', lineHeight: 1.1, color: '#fff', marginBottom: '4px' }}>
                        {anime.english_name || anime.name}
                      </h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{anime.name}</p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onToggleFavorite(anime)}
                      className={isFavorite ? 'btn-gold' : 'btn-secondary'}
                      style={{ flex: '1 1 220px', justifyContent: 'center', padding: '12px 16px' }}
                    >
                      {isFavorite ? <Check size={18} /> : <BookmarkPlus size={18} />}
                      {isFavorite ? 'Saved' : 'Save to My List'}
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px 12px', border: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Studio</span>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{anime.studio}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '10px 12px', border: '1px solid var(--glass-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Year</span>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{anime.premiered_year}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '12px', border: '1px solid var(--glass-border)' }}>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Genres</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {genres.map((g, i) => (
                        <span key={i} className="glass-pill" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{g}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {streamingSources.length > 0 ? (
                  streamingSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                    >
                      <Play size={14} fill="currentColor" /> {src.name} <ExternalLink size={12} />
                    </a>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Official sources will appear here when available</span>
                )}
              </div>

              {anime.explanation && (
                <div style={{
                  background: 'rgba(0, 242, 254, 0.08)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <Sparkles size={20} color="#00f2fe" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ color: '#00f2fe', fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>
                      Why this fits you ({anime.match_percentage || '95'}% fit)
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                      {anime.explanation}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '18px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>Synopsis</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {anime.synopsis}
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '18px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>More from this vibe</h3>

                {loadingSimilar ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Finding similar titles...</p>
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
                        onSelect={(a) => onSelectAnime(a)}
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
