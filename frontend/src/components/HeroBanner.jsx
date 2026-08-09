import React from 'react';
import { Play, Info, Star, ExternalLink, BookmarkPlus, Check } from 'lucide-react';

export default function HeroBanner({ anime, onSelect, onToggleFavorite, isFavorite }) {
  if (!anime) return null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '620px',
      borderRadius: '24px',
      overflow: 'hidden',
      marginBottom: '40px',
      display: 'flex',
      alignItems: 'flex-end',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      {/* Background Image Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${anime.backdrop_url || anime.poster_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.55) contrast(1.1)',
        transform: 'scale(1.02)'
      }} />

      {/* Cinematic Gradient Overlays */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(19, 19, 19, 0.98) 0%, rgba(19, 19, 19, 0.6) 50%, rgba(19, 19, 19, 0.2) 100%)'
      }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to right, rgba(19, 19, 19, 0.95) 0%, rgba(19, 19, 19, 0.4) 60%, transparent 100%)'
      }} />

      {/* Hero Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '48px 52px',
        maxWidth: '860px'
      }}>
        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'var(--primary-red)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '4px',
            letterSpacing: '0.05em'
          }}>
            FEATURED SPOTLIGHT
          </span>

          <span style={{
            background: 'rgba(233, 195, 73, 0.2)',
            color: 'var(--secondary-gold)',
            border: '1px solid rgba(233, 195, 73, 0.4)',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Star size={14} fill="currentColor" /> {anime.score} / 10 MAL
          </span>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {anime.premiered_year} • {anime.studio} • {anime.type} ({anime.episodes} eps)
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-headline)',
          fontSize: 'clamp(2.8rem, 5vw, 4.8rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: '12px',
          color: '#ffffff',
          textShadow: '0 4px 20px rgba(0,0,0,0.8)'
        }}>
          {anime.english_name || anime.name}
        </h2>

        {/* Synopsis Snippet */}
        <p style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '24px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)'
        }}>
          {anime.synopsis}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onSelect(anime)}
            className="btn-primary" 
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            <Play size={18} fill="currentColor" /> Open Details
          </button>

          <button
            onClick={() => onToggleFavorite(anime)}
            className={isFavorite ? "btn-gold" : "btn-secondary"}
            style={{ padding: '12px 22px' }}
          >
            {isFavorite ? (
              <>
                <Check size={18} /> In Favorites
              </>
            ) : (
              <>
                <BookmarkPlus size={18} /> Add to Favorites
              </>
            )}
          </button>

          <button
            onClick={() => onSelect(anime)}
            className="btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            <Info size={18} /> Why this fits
          </button>
        </div>
      </div>
    </div>
  );
}
