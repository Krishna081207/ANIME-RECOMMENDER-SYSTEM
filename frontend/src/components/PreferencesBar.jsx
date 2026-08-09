import React from 'react';
import { SlidersHorizontal, Sparkles, Filter, Check, X, RotateCcw } from 'lucide-react';

export default function PreferencesBar({
  genres,
  selectedGenres,
  onToggleGenre,
  minScore,
  setMinScore,
  favoriteAnimeList,
  onRemoveFavorite,
  onRecalculate,
  onReset
}) {
  return (
    <div className="glass-panel" style={{
      padding: '20px 24px',
      marginBottom: '32px',
      border: '1px solid var(--glass-border)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={20} color="var(--secondary-gold)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            Preference Tuner & Filters
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onReset}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <RotateCcw size={14} /> Reset Filters
          </button>

          <button
            onClick={onRecalculate}
            className="btn-gold"
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
          >
            <Sparkles size={16} /> Refresh Recommendations
          </button>
        </div>
      </div>

      {/* Selected Favorites Pill Row */}
      {favoriteAnimeList.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            YOUR SAVED TITLES ({favoriteAnimeList.length} SELECTED):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {favoriteAnimeList.map((a) => (
              <span
                key={a.anime_id}
                style={{
                  background: 'rgba(233, 195, 73, 0.15)',
                  border: '1px solid rgba(233, 195, 73, 0.4)',
                  color: 'var(--secondary-gold)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {a.english_name || a.name}
                <X 
                  size={14} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => onRemoveFavorite(a.anime_id)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Genre Chips Grid */}
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          PREFERRED GENRES:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {genres.map((g) => {
            const isSelected = selectedGenres.includes(g);
            return (
              <button
                key={g}
                onClick={() => onToggleGenre(g)}
                style={{
                  background: isSelected ? 'var(--primary-red)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--primary-red)' : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isSelected && <Check size={12} />}
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Score Slider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)'
      }}>
        <Filter size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '140px' }}>
          Minimum Score: <strong>{minScore.toFixed(1)}+</strong>
        </span>
        <input 
          type="range"
          min="0"
          max="9.5"
          step="0.5"
          value={minScore}
          onChange={(e) => setMinScore(parseFloat(e.target.value))}
          style={{
            flexGrow: 1,
            accentColor: 'var(--primary-red)',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
}
