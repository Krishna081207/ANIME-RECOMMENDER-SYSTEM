import React from 'react';
import { X, Trash2, BookmarkCheck, Play, Star, ExternalLink } from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearFavorites,
  onSelectAnime
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      {/* Drawer Container */}
      <div 
        className="glass-panel-dense fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookmarkCheck size={22} color="var(--secondary-gold)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              Saved Favorites ({favorites.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{
          padding: '20px',
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {favorites.length === 0 ? (
            <div style={{ textCenter: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <BookmarkCheck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontSize: '0.95rem' }}>No saved anime in your list yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                Click the bookmark icon on any anime card to seed your personalized ML recommendations.
              </p>
            </div>
          ) : (
            favorites.map((anime) => (
              <div
                key={anime.anime_id}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={anime.poster_url} 
                  alt={anime.name}
                  style={{
                    width: '54px',
                    height: '76px',
                    objectFit: 'cover',
                    borderRadius: '6px'
                  }}
                />

                <div style={{ flexGrow: 1 }}>
                  <h4 
                    onClick={() => {
                      onSelectAnime(anime);
                      onClose();
                    }}
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {anime.english_name || anime.name}
                  </h4>

                  <span style={{ fontSize: '0.78rem', color: 'var(--secondary-gold)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <Star size={12} fill="currentColor" /> {anime.score} MAL
                  </span>

                  <div style={{ marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        onSelectAnime(anime);
                        onClose();
                      }}
                      className="btn-primary"
                      style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                    >
                      <Play size={11} fill="currentColor" /> Watch
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFavorite(anime.anime_id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px'
                  }}
                  title="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {favorites.length > 0 && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--glass-border)'
          }}>
            <button
              onClick={onClearFavorites}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', color: '#ff4d4d' }}
            >
              <Trash2 size={16} /> Clear All Saved
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
