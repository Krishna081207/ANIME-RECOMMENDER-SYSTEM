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
      const res = await fetch(`/api/anime/${id}`);
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
        fetch('/api/anime'),
        fetch('/api/genres')
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
      const res = await fetch('/api/recommend/personalized', {
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
            {heroAnime && activeTab === 'discover' && !searchQuery && (
              <HeroBanner
                anime={heroAnime}
                onSelect={(a) => handleSelectAnime(a)}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite(heroAnime.anime_id)}
              />
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
              marginBottom: '20px'
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
                {activeTab === 'personalized' ? (
                  <>
                    <Sparkles size={24} color="var(--secondary-gold)" /> Your Live ML Recommendation Feed
                  </>
                ) : (
                  <>
                    <Flame size={24} color="var(--primary-red)" /> Top Anime Library ({filteredAnime.length})
                  </>
                )}
              </h2>

              {activeTab === 'personalized' && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Seeded by {favorites.length} saved favorites & {selectedGenres.length} genre preferences
                </span>
              )}
            </div>

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
