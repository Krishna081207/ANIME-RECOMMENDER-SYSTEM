import React, { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import useApiResource from "../hooks/useApiResource";

export default function WatchPage() {
  const { animeId } = useParams();
  const validId = /^[1-9]\d*$/.test(animeId);
  const availability = useApiResource(validId ? `/api/anime/${animeId}/streaming` : null);
  const provider = availability.data?.sources[0];
  const needsFallback = availability.error || availability.data?.sources.length === 0;
  const anime = useApiResource(validId && needsFallback ? `/api/anime/${animeId}` : null);
  const platformSearches = (anime.data?.streaming_sources || []).filter((source) => source.name !== "MyAnimeList");

  useEffect(() => {
    if (provider) window.location.replace(provider.url);
  }, [provider]);

  return (
    <main className="anime-page">
      <div className="anime-status watch-status" role="status">
        {availability.loading ? (
          <h1>Finding where to watch…</h1>
        ) : availability.error ? (
          <>
            <h1>Could not check streaming availability</h1>
            <p>{availability.error}</p>
            <button className="btn-secondary" onClick={availability.retry}>Try again</button>
          </>
        ) : provider ? (
          <>
            <h1>Opening {provider.name}</h1>
            <p>{availability.data.title}</p>
            <a href={provider.url} className="btn-primary">Continue to {provider.name} <ExternalLink size={16} /></a>
          </>
        ) : (
          <>
            <h1>{validId ? "No streaming provider is listed" : "Anime not found"}</h1>
            {availability.data && (
              <>
                <p>{availability.data.title}</p>
                <a href={availability.data.listing_url} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  Check the MyAnimeList listing <ExternalLink size={16} />
                </a>
              </>
            )}
          </>
        )}
        {needsFallback && platformSearches.length > 0 && (
          <section className="watch-platform-searches" aria-labelledby="platform-searches-heading">
            <h2 id="platform-searches-heading">Search streaming platforms</h2>
            <div className="picks-chips">
              {platformSearches.map((source) => (
                <a key={source.url} href={source.url} className="btn-secondary" target="_blank" rel="noopener noreferrer">
                  Search {source.name} <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </section>
        )}
        <p className="picks-hint">Streaming availability depends on your location and subscription.</p>
        <Link to="/" className="btn-secondary">Back to Discover</Link>
      </div>
    </main>
  );
}
