import React, { useEffect, useState } from 'react';
import { Cpu, Database, Network, BarChart3, Layers, BookOpen, CheckCircle2 } from 'lucide-react';

export default function MLStatsDashboard() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMlInfo();
  }, []);

  const fetchMlInfo = async () => {
    try {
      const res = await fetch('/api/ml-info');
      const data = await res.json();
      setInfo(data);
    } catch (e) {
      console.error("Failed to fetch ML info", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textCenter: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading Machine Learning model architecture and vocabulary metrics...</p>
      </div>
    );
  }

  if (!info) return null;

  const topGenres = Object.entries(info.genre_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxGenreCount = topGenres.length > 0 ? topGenres[0][1] : 1;

  return (
    <div className="fade-in" style={{ paddingBottom: '48px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '32px 40px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(32, 31, 31, 0.9), rgba(229, 9, 20, 0.15))',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <Cpu size={32} color="var(--primary-red)" />
          <div>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
              Machine Learning Model Dashboard & Architecture
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Interactive Mini-Project Technical Presentation Tab (Scikit-Learn + TF-IDF Vector Space)
            </p>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary-gold)', marginBottom: '8px' }}>
            <Database size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TOTAL ANIME INDEXED</span>
          </div>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>{info.total_anime}</p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Rich Kaggle Anime Dataset</span>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00f2fe', marginBottom: '8px' }}>
            <BookOpen size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>TF-IDF VOCAB SIZE</span>
          </div>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>{info.vocab_size}</p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sublinear n-grams (1, 2)</span>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-red)', marginBottom: '8px' }}>
            <Layers size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>MATRIX SHAPE</span>
          </div>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>
            [{info.matrix_shape[0]}, {info.matrix_shape[1]}]
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sparse Cosine Similarity</span>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a78bfa', marginBottom: '8px' }}>
            <Building2Icon size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>UNIQUE STUDIOS</span>
          </div>
          <p style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff' }}>{info.studios_count}</p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>MAPPA, Madhouse, ufotable...</span>
        </div>
      </div>

      {/* Algorithm Pipeline Section */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={22} color="var(--primary-red)" /> ML Recommender Pipeline Architecture
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          position: 'relative'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ color: 'var(--secondary-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>STEP 1: PREPROCESSING</div>
            <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>Feature Combination</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Concatenates weighted genre tags, synopses, studios, and release type into unified text vectors.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ color: '#00f2fe', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>STEP 2: VECTORIZATION</div>
            <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>TF-IDF Matrix Fitting</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Uses sublinear term-frequency scaling and unigram/bigram n-grams to penalize common stop words.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ color: 'var(--primary-red)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>STEP 3: SIMILARITY SCORING</div>
            <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>Cosine Distance</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Computes inner dot products of normalized vectors in {info.vocab_size}-dimensional feature space.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>STEP 4: HYBRID SERVING</div>
            <h4 style={{ color: '#ffffff', marginBottom: '6px' }}>Personalized Ranking</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Aggregates user favorite vectors, applies genre boosting, and generates natural language match reasons.
            </p>
          </div>
        </div>
      </div>

      {/* Genre Distribution Chart */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={22} color="var(--secondary-gold)" /> Dataset Genre Distribution Metrics
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topGenres.map(([genre, count]) => {
            const pct = (count / maxGenreCount) * 100;
            return (
              <div key={genre} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ width: '140px', fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {genre}
                </span>
                <div style={{ flexGrow: 1, background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', height: '22px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--primary-red), var(--secondary-gold))',
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
                <span style={{ minWidth: '40px', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocabulary Feature Sample */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
          TF-IDF Model Feature Vocabulary Tokens (Sample)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Sample terms extracted from synopses and metadata used to construct high-dimensional vector representations:
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {info.sample_vocabulary.map((term, i) => (
            <span key={i} className="glass-pill" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {term}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Building2Icon({ size }) {
  return <Database size={size} />;
}
