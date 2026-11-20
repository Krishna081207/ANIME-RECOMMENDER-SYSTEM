import { useState } from "react";

export function useSearch(animes) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = animes.filter(a => {
    const term = searchQuery.toLowerCase();
    return (
      (a.name && a.name.toLowerCase().includes(term)) ||
      (a.english_name && a.english_name.toLowerCase().includes(term))
    );
  });

  return {
    searchQuery,
    setSearchQuery,
    filtered,
  };
}