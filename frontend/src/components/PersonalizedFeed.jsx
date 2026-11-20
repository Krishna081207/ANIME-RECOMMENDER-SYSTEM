import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, RotateCcw } from "lucide-react";
import AnimeCard from "./AnimeCard";
import AnimeSeedPicker from "./AnimeSeedPicker";
import RecommendationTools, { recommendationTools } from "./RecommendationTools";
import useApiResource from "../hooks/useApiResource";

export default function PersonalizedFeed({ allGenres = [], favorites, onToggleFavorite, onSelectAnime }) {
  const { state } = useLocation();
  const [selectedTool, setSelectedTool] = useState("blend");
  const [echoSeeds, setEchoSeeds] = useState([]);
  const [seeds, setSeeds] = useState(favorites);
  const [selectedGenres, setSelectedGenres] = useState(state?.genres || []);
  const [minScore, setMinScore] = useState(state?.minScore ?? 7);
  const [description, setDescription] = useState("");
  const [resetCount, setResetCount] = useState(0);
  const [submission, setSubmission] = useState(null);
  const tool = recommendationTools.find((item) => item.id === selectedTool);
  const picks = useApiResource(submission?.path, { body: submission?.body });
  const recommendations = picks.data?.recommendations || [];
  const hasInput = {
    echo: echoSeeds.length > 0,
    blend: seeds.length > 0 || selectedGenres.length > 0,
    story: description.trim().length >= 3
  }[selectedTool];

  function selectTool(id) {
    if (id === selectedTool) return;
    setSelectedTool(id);
    setSubmission(null);
  }

  function reset() {
    setEchoSeeds([]);
    setSeeds([]);
    setSelectedGenres([]);
    setMinScore(7);
    setDescription("");
    setSubmission(null);
    setResetCount((previous) => previous + 1);
  }

  function toggleGenre(genre) {
    setSelectedGenres((previous) => (
      previous.includes(genre) ? previous.filter((item) => item !== genre) : [...previous, genre]
    ));
  }

  const common = { min_score: minScore, top_n: 18 };
  const requests = {
    echo: {
      path: "/api/recommend/similar",
      body: { ...common, anime_id: echoSeeds[0]?.anime_id }
    },
    blend: {
      path: "/api/recommend/personalized",
      body: { ...common, favorite_ids: seeds.map((anime) => anime.anime_id), favorite_genres: selectedGenres }
    },
    story: {
      path: "/api/recommend/text",
      body: { ...common, query: description.trim() }
    }
  };
  const request = requests[selectedTool];
  const requestBody = JSON.stringify(request.body);
  const inputChanged = submission && submission.body !== requestBody;

  function submit(event) {
    event.preventDefault();
    if (!hasInput) return;
    setSubmission({ path: request.path, body: requestBody, name: tool.name });
    picks.retry();
  }

  return (
    <main className="anime-page">
      <div className="picks-page-heading">
        <h1>My Picks</h1>
        <p>Find your next obsession.</p>
      </div>

      <RecommendationTools selectedTool={selectedTool} onSelect={selectTool} />

      <form className={`glass-panel picks-preferences tool-form tool-form-${selectedTool}`} onSubmit={submit} aria-labelledby="picks-preferences-heading">
        <div className="picks-toolbar">
          <h2 id="picks-preferences-heading">{tool.name}</h2>
          <button type="button" className="btn-secondary" onClick={reset}>
            <RotateCcw size={16} /> Reset inputs
          </button>
        </div>

        {selectedTool === "echo" && (
          <AnimeSeedPicker key={`echo-${resetCount}`} selected={echoSeeds} onChange={setEchoSeeds} />
        )}
        {selectedTool === "blend" && (
          <>
            <AnimeSeedPicker key={`blend-${resetCount}`} selected={seeds} onChange={setSeeds} multiple favorites={favorites} />
            {allGenres.length > 0 && (
              <fieldset className="genre-selection">
                <legend>Pick your genres</legend>
                <div className="picks-chips">
                  {allGenres.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      className="glass-pill"
                      aria-pressed={selectedGenres.includes(genre)}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </>
        )}
        {selectedTool === "story" && (
          <div className="story-input">
            <label htmlFor="story-description">What's your next story?</label>
            <textarea
              id="story-description"
              placeholder="A detective chasing a supernatural mystery in a futuristic city…"
              rows={4}
              minLength={3}
              maxLength={1000}
              required
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <span className="picks-hint">{description.length}/1000</span>
          </div>
        )}

        <label className="score-filter">
          <span>Minimum score <strong>{minScore.toFixed(1)}+</strong></span>
          <input type="range" min="0" max="10" step="0.5" value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} />
        </label>

        <div className="tool-submit">
          <button type="submit" className="btn-gold" disabled={!hasInput || picks.loading}>
            {picks.loading ? "Finding your anime…" : tool.action} <ArrowRight size={17} />
          </button>
        </div>
      </form>

      {picks.loading ? (
        <p className="anime-status" role="status">Finding your anime…</p>
      ) : picks.error ? (
        <div className="anime-status" role="alert">
          <h2>Could not load recommendations</h2>
          <p>{picks.error}</p>
          <button className="btn-secondary" onClick={picks.retry}>Retry recommendations</button>
        </div>
      ) : submission && (
        <section aria-labelledby="recommendation-results-heading">
          <div className="picks-toolbar recommendation-heading">
            <h2 id="recommendation-results-heading">Your {submission.name} matches</h2>
            <span className="picks-hint" role="status">{recommendations.length} titles found</span>
          </div>
          {inputChanged && <p className="picks-hint updated-input-hint">Run {tool.name} again to use your updated inputs.</p>}
          {recommendations.length === 0 ? (
            <div className="anime-status">
              <h3>No matching anime</h3>
              <p>Try different inputs or a lower minimum score.</p>
            </div>
          ) : (
            <div className="anime-list-grid">
              {recommendations.map((anime) => (
                <AnimeCard
                  key={anime.anime_id}
                  anime={anime}
                  onSelect={onSelectAnime}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={favorites.some((item) => item.anime_id === anime.anime_id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
