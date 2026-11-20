import React from "react";
import { ArrowUpRight, Layers, Orbit, Wand2 } from "lucide-react";

export const recommendationTools = [
  {
    id: "echo",
    name: "Anime Echo",
    description: "Loved a title? Find something with a similar feel.",
    action: "Find my echo",
    Icon: Orbit
  },
  {
    id: "blend",
    name: "Taste Blend",
    description: "Mix your favorite titles and genres into your next watch.",
    action: "Blend my taste",
    Icon: Layers
  },
  {
    id: "story",
    name: "Story Spark",
    description: "Describe the story you're craving. Discover anime that fits.",
    action: "Find my story",
    Icon: Wand2
  }
];

export default function RecommendationTools({ selectedTool, onSelect }) {
  return (
    <div className="recommendation-tools" role="group" aria-label="Recommendation tools">
      {recommendationTools.map(({ id, name, description, Icon }) => (
        <button
          key={id}
          type="button"
          className={`recommendation-tool recommendation-tool-${id}`}
          aria-pressed={selectedTool === id}
          onClick={() => onSelect(id)}
        >
          <span className="tool-icon"><Icon size={24} aria-hidden="true" /></span>
          <span className="tool-name">{name} <ArrowUpRight size={17} aria-hidden="true" /></span>
          <span className="tool-description">{description}</span>
        </button>
      ))}
    </div>
  );
}
