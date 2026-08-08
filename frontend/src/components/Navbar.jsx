import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Film, Search, History, Cpu, PlayCircle } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  favoritesCount,
  onOpenHistory
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === '/personalized') return 'personalized';
    if (location.pathname === '/dashboard') return 'dashboard';
    return 'discover';
  };

  const activeTab = getActiveTab();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(19, 19, 19, 0.88)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(229, 226, 225, 0.1)',
      padding: '14px 28px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #e50914, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)'
          }}>
            <Film size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: '#ffffff'
            }}>
              CINEMATCH <span style={{ color: '#e50914', fontFamily: 'var(--font-body)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ANIME</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI ML Recommendation Engine</p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(32, 31, 31, 0.6)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--glass-border)'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'discover' ? 600 : 400,
              color: activeTab === 'discover' ? '#ffffff' : 'var(--text-muted)',
              background: activeTab === 'discover' ? 'var(--primary-red)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <PlayCircle size={16} /> Discover
          </button>
          
          <button
            onClick={() => navigate('/personalized')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'personalized' ? 600 : 400,
              color: activeTab === 'personalized' ? '#131313' : 'var(--text-muted)',
              background: activeTab === 'personalized' ? 'var(--secondary-gold)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={16} /> My ML Feed
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: activeTab === 'dashboard' ? 600 : 400,
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-muted)',
              background: activeTab === 'dashboard' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Cpu size={16} /> ML Insights
          </button>
        </nav>

        {/* Right Search & Favorite Drawer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search anime title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '8px 12px 8px 36px',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                width: '200px',
                transition: 'all 0.2s'
              }}
            />
          </div>

          <button
            onClick={onOpenHistory}
            className="btn-secondary"
            style={{ padding: '8px 14px', position: 'relative' }}
          >
            <History size={18} />
            <span>Saved</span>
            {favoritesCount > 0 && (
              <span style={{
                background: 'var(--primary-red)',
                color: '#ffffff',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '2px 7px',
                marginLeft: '4px'
              }}>
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
