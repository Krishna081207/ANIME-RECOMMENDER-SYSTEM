import React from 'react';
import { Star, Play, Sparkles, BookmarkPlus, Check } from 'lucide-react';

export default function AnimeCard({ anime, onSelect, onToggleFavorite, isFavorite }) {
  const genres = strToArr(anime.genres);

  function strToArr(str) {
    if (!str) return [];
    return str.split(',').map(s => s.trim());
  }

  return (
    <div 
      className="glass-panel fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px var(--primary-red-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Poster Image & Overlay Pill Badges */}
      <div 
        onClick={() => onSelect(anime)}
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '135%', // 2:3 Aspect Ratio
          overflow: 'hidden',
          background: 'var(--surface-container)'
        }}
      >
        <img 
          src={anime.poster_url} 
          alt={anime.name}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
        />

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(19, 19, 19, 0.95) 0%, transparent 60%)'
        }} />

        {/* ML Match Badge if present */}
        {anime.match_percentage !== undefined && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            color: '#0e0e0e',
            fontWeight: 800,
            fontSize: '0.8rem',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0, 242, 254, 0.4)'
          }}>
            <Sparkles size={13} fill="#0e0e0e" /> {anime.match_percentage}% MATCH
          </div>
        )}

        {/* MAL Score Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(19, 19, 19, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(233, 195, 73, 0.5)',
          color: 'var(--secondary-gold)',
          fontWeight: 700,
          fontSize: '0.8rem',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Star size={12} fill="currentColor" /> {anime.score}
        </div>

        {/* Favorite Bookmark Quick Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(anime);
          }}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: isFavorite ? 'var(--secondary-gold)' : 'rgba(19, 19, 19, 0.8)',
            color: isFavorite ? '#131313' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s'
          }}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          {isFavorite ? <Check size={18} /> : <BookmarkPlus size={18} />}
        </button>
      </div>

      {/* Card Info Body */}
      <div 
        onClick={() => onSelect(anime)}
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {anime.english_name || anime.name}
          </h3>

          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '10px'
          }}>
            {anime.premiered_year} • {anime.studio}
          </p>

          {/* Genre Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
            {genres.slice(0, 3).map((g, i) => (
              <span key={i} style={{
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary)',
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* ML Explanation snippet if present */}
        {anime.explanation && (
          <p style={{
            fontSize: '0.75rem',
            color: '#00f2fe',
            lineHeight: 1.3,
            background: 'rgba(0, 242, 254, 0.06)',
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(0, 242, 254, 0.15)',
            marginTop: 'auto'
          }}>
            💡 {anime.explanation}
          </p>
        )}
      </div>
    </div>
  );
}
