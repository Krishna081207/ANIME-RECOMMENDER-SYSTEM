import { useMemo, useState } from "react";

export function useGenreFilter(animes) {
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Extract unique genres
  const allGenres = useMemo(() => {
    const genreSet = new Set();
    animes.forEach(a => {
      (a.genres || "").split(",").forEach(g => g.trim() && genreSet.add(g.trim()));
    });
    return Array.from(genreSet);
  }, [animes]);

  return {
    allGenres,
    selectedGenres,
    setSelectedGenres,
  };
}