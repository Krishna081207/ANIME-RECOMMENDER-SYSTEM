import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import PreferencesBar from './components/PreferencesBar';
import AnimeCard from './components/AnimeCard';
import AnimeModal from './components/AnimeModal';
import MLStatsDashboard from './components/MLStatsDashboard';
import HistoryDrawer from './components/HistoryDrawer';
import { Sparkles, Flame, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App({ activeTabProp = 'discover' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [animeList, setAnimeList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minScore, setMinScore] = useState(0.0);
  
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Derive active tab from route
  const getActiveTab = () => {
    if (location.pathname === '/personalized') return 'personalized';
    if (location.pathname === '/dashboard') return 'dashboard';
    return 'discover';
  };

  const activeTab = getActiveTab();
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('cinematch_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cinematch_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handle deep link /anime/:id route
  useEffect(() => {
    if (params.id) {
      const animeId = parseInt(params.id, 10);
      if (!isNaN(animeId)) {
        fetchAnimeById(animeId);
      }
    }
  }, [params.id]);

  const fetchAnimeById = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/anime/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAnime(data);
      }
    } catch (e) {
      console.error("Failed to load anime deep link", e);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [animeRes, genreRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/anime`),
        fetch(`${API_BASE_URL}/api/genres`)
      ]);
      const animeData = await animeRes.json();
      const genreData = await genreRes.json();

      setAnimeList(animeData.data || []);
      setGenres(genreData.genres || []);
      
      // Initial personalized recommendations fetch
      fetchRecommendations(favorites.map(f => f.anime_id), selectedGenres, minScore);
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (favIds = [], favGenres = [], score = 0.0) => {
    setLoadingRecs(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend/personalized`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          favorite_ids: favIds,
          favorite_genres: favGenres,
          min_score: score,
          top_n: 12
        })
      });
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (e) {
      console.error("Failed to load ML recommendations", e);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleToggleFavorite = (anime) => {
    setFavorites((prev) => {
      const exists = prev.some(f => f.anime_id === anime.anime_id);
      if (exists) {
        return prev.filter(f => f.anime_id !== anime.anime_id);
      } else {
        return [...prev, anime];
      }
    });
  };

  const isFavorite = (animeId) => {
    return favorites.some(f => f.anime_id === animeId);
  };

  const handleToggleGenre = (genre) => {
    setSelectedGenres((prev) => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleRecalculate = () => {
    fetchRecommendations(favorites.map(f => f.anime_id), selectedGenres, minScore);
  };

  const handleResetFilters = () => {
    setSelectedGenres([]);
    setMinScore(0.0);
    setSearchQuery('');
    fetchRecommendations(favorites.map(f => f.anime_id), [], 0.0);
  };

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    if (anime && anime.anime_id) {
      navigate(`/anime/${anime.anime_id}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedAnime(null);
    if (location.pathname.startsWith('/anime/')) {
      navigate('/');
    }
  };

  // Local filtered search list for Discover tab
  const filteredAnime = animeList.filter((a) => {
    const query = searchQuery.trim().toLowerCase();
    const nameMatch = a.name.toLowerCase().includes(query) || (a.english_name && a.english_name.toLowerCase().includes(query));
    const genreMatch = selectedGenres.length === 0 || selectedGenres.some(g => a.genres && a.genres.includes(g));
    const scoreMatch = a.score >= minScore;
    return nameMatch && genreMatch && scoreMatch;
  });

  const heroAnime = animeList.length > 0 ? animeList[0] : null;
  const shelfAnime = activeTab === 'personalized'
    ? recommendations.slice(0, 8)
    : animeList.slice(0, 8);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        favoritesCount={favorites.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px',
        flexGrow: 1
      }}>
        {/* ML Stats Dashboard Tab */}
        {activeTab === 'dashboard' && <MLStatsDashboard />}

        {/* Discover / Personalized Views */}
        {activeTab !== 'dashboard' && (
          <>
            {/* Featured Hero Banner */}
            {heroAnime && activeTab === 'discover' && !hasSearchQuery && (
              <HeroBanner
                anime={heroAnime}
                onSelect={(a) => handleSelectAnime(a)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite(heroAnime.anime_id)}
              />
            )}

            {!hasSearchQuery && shelfAnime.length > 0 && (
              <section style={{ marginBottom: '36px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'space-between',
                  gap: '16px',
                  marginBottom: '18px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--secondary-gold)',
                      marginBottom: '6px'
                    }}>
                      Featured Shelf
                    </div>
                    <h2 style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      marginBottom: '6px'
                    }}>
                      {activeTab === 'personalized' ? 'Because You Liked This' : 'Recommended for You'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      {activeTab === 'personalized'
                        ? 'A cinematic shelf tuned to your saved favorites and genre preferences.'
                        : 'A curated horizontal row of the strongest picks from the catalog.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '18px',
                  overflowX: 'auto',
                  paddingBottom: '16px',
                  scrollSnapType: 'x mandatory'
                }}>
                  {shelfAnime.map((anime) => (
                    <div key={`shelf-${anime.anime_id}`} style={{ flex: '0 0 240px', scrollSnapAlign: 'start' }}>
                      <AnimeCard
                        anime={anime}
                        onSelect={(a) => handleSelectAnime(a)}
                        onToggleFavorite={handleToggleFavorite}
                        isFavorite={isFavorite(anime.anime_id)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Interactive Preferences & Filter Bar */}
            <PreferencesBar
              genres={genres}
              selectedGenres={selectedGenres}
              onToggleGenre={handleToggleGenre}
              minScore={minScore}
              setMinScore={setMinScore}
              favoriteAnimeList={favorites}
              onRemoveFavorite={(id) => setFavorites(prev => prev.filter(f => f.anime_id !== id))}
              onRecalculate={handleRecalculate}
              onReset={handleResetFilters}
            />

            {/* View Section Title */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <h2 style={{
                fontFamily: 'var(--font-headline)',
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {hasSearchQuery ? (
                  <>
                    <AlertCircle size={24} color="var(--secondary-gold)" /> Search Results
                  </>
                ) : activeTab === 'personalized' ? (
                  <>
                    <Sparkles size={24} color="var(--secondary-gold)" /> Your Live ML Recommendation Feed
                  </>
                ) : (
                  <>
                    <Flame size={24} color="var(--primary-red)" /> Top Anime Library
                  </>
                )}
              </h2>

              {activeTab === 'personalized' && !hasSearchQuery && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Seeded by {favorites.length} saved favorites & {selectedGenres.length} genre preferences
                </span>
              )}

              {hasSearchQuery && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {filteredAnime.length} matches
                </span>
              )}
            </div>

            {hasSearchQuery && genres.length > 0 && (
              <div style={{
                marginBottom: '18px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {genres.slice(0, 6).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSearchQuery(genre)}
                    className="glass-pill"
                    style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}

            {/* Grid Content */}
            {loading || (activeTab === 'personalized' && loadingRecs) ? (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                <Sparkles size={36} color="var(--primary-red)" className="pulse-glow" style={{ marginBottom: '16px' }} />
                <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>
                  Computing TF-IDF Vector Similarities...
                </p>
              </div>
            ) : activeTab === 'personalized' ? (
              recommendations.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '24px'
                }}>
                  {recommendations.map((anime) => (
                    <AnimeCard
                      key={anime.anime_id}
                      anime={anime}
                      onSelect={(a) => handleSelectAnime(a)}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite(anime.anime_id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <AlertCircle size={32} color="var(--secondary-gold)" style={{ marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>No ML matches found with current score threshold.</p>
                  <button onClick={handleResetFilters} className="btn-secondary" style={{ marginTop: '16px' }}>
                    Reset Filters
                  </button>
                </div>
              )
            ) : (
              filteredAnime.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '24px'
                }}>
                  {filteredAnime.map((anime) => (
                    <AnimeCard
                      key={anime.anime_id}
                      anime={anime}
                      onSelect={(a) => handleSelectAnime(a)}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorite={isFavorite(anime.anime_id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <AlertCircle size={32} color="var(--secondary-gold)" style={{ marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>No anime match "{searchQuery}".</p>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-darker)',
        borderTop: '1px solid var(--glass-border)',
        padding: '24px',
        textAlign: 'center',
        marginTop: 'auto'
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          CineMatch Anime Recommender System • Powered by FastAPI & Scikit-Learn (TF-IDF + Cosine Similarity) • StitchMCP Cinematic Noir Theme
        </p>
      </footer>

      {/* Full Detail Anime Modal */}
      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={handleCloseModal}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite(selectedAnime.anime_id)}
          onSelectAnime={(a) => handleSelectAnime(a)}
        />
      )}

      {/* History & Favorites Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        favorites={favorites}
        onRemoveFavorite={(id) => setFavorites(prev => prev.filter(f => f.anime_id !== id))}
        onClearFavorites={() => setFavorites([])}
        onSelectAnime={(a) => handleSelectAnime(a)}
      />
    </div>
  );
}
