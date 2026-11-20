import React from "react";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function ViewAnimeLink({ anime, className = "btn-primary" }) {
  const title = anime.english_name || anime.name;

  return (
    <Link
      to={`/watch/${anime.anime_id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} view-anime-link`}
      aria-label={`View ${title}`}
      title={`View ${title} on a streaming service`}
    >
      <Play size={16} aria-hidden="true" /> View
    </Link>
  );
}
