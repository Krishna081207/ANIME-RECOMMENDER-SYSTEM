import { useState } from "react";

export function useScoreFilter(animes) {
  const [minScore, setMinScore] = useState(0);

  const filtered = animes.filter(a => {
    const score = parseFloat(a.score) || 0;
    return score >= minScore;
  });

  return {
    minScore,
    setMinScore,
    filtered,
  };
}