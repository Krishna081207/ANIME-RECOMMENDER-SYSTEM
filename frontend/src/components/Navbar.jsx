import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Search,
  Play,
  Star,
  ExternalLink,
  BookmarkCheck,
  History,
  Cpu,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Check,
} from "lucide-react";

export default function Navbar({
  searchQuery,
  setSearchQuery,
  favoritesCount,
  onOpenHistory,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === "/personalized") return "personalized";
    if (location.pathname === "/library") return "library";
    if (location.pathname === "/ml-insights") return "ml-insights";
    return "discover";
  };

  const activeTab = getActiveTab();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(19, 19, 19, 0.72)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(229, 226, 225, 0.1)",
        padding: "14px 24px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "18px" }}>
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #e50914, #ffb4aa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(229, 9, 20, 0.45)",
            }}
          >
            <i className="bi bi-film" style={{ color: "#ffffff", fontSize: "24px" }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.35rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#ffffff",
              }}
            >
              CINEMATCH <span
                style={{
                  color: "#e50914",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                ANIME
              </span>
            </h1>
            <p
              style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
            >
              Personalized anime discovery
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(13, 21, 15, 0.85)",
            padding: "4px 6px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--glass-border)",
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              border: "none",
              fontSize: "0.88rem",
              fontWeight: activeTab === "discover" ? 700 : 500,
              color: activeTab === "discover" ? "#ffffff" : "var(--text-muted)",
              background: activeTab === "discover" ? "var(--primary-red)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <i className="bi bi-play-circle" style={{ fontSize: "16px" }} /> Discover
          </button>

          <button
            onClick={() => navigate("/personalized")}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              border: activeTab === "personalized" ? "1px solid rgba(229, 9, 20, 0.4)" : "none",
              fontSize: "0.88rem",
              fontWeight: activeTab === "personalized" ? 700 : 500,
              color: activeTab === "personalized" ? "#ff6b6b" : "var(--text-muted)",
              background: activeTab === "personalized" ? "rgba(229, 9, 20, 0.15)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <i className="bi bi-sparkles" style={{ fontSize: "16px" }} /> My Picks
          </button>

          <button
            onClick={() => navigate("/library")}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              border: "none",
              fontSize: "0.88rem",
              fontWeight: activeTab === "library" ? 700 : 500,
              color: activeTab === "library" ? "#131313" : "var(--text-muted)",
              background: activeTab === "library" ? "var(--secondary-gold)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <i className="bi bi-collection-play" style={{ fontSize: "16px" }} /> My Library
          </button>

          <button
            onClick={() => navigate("/ml-insights")}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              border: activeTab === "ml-insights" ? "1px solid rgba(0, 242, 254, 0.4)" : "none",
              fontSize: "0.88rem",
              fontWeight: activeTab === "ml-insights" ? 700 : 500,
              color: activeTab === "ml-insights" ? "#00f2fe" : "var(--text-muted)",
              background: activeTab === "ml-insights" ? "rgba(0, 242, 254, 0.15)" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <i className="bi bi-cpu" style={{ fontSize: "16px" }} /> ML Insights
          </button>
        </nav>

        {/* Right Search & Favorite Drawer Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <i className="bi bi-search" style={{ position: "absolute", left: "12px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search anime title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px 8px 36px",
                color: "#ffffff",
                fontSize: "0.88rem",
                outline: "none",
                width: "220px",
                transition: "all 0.2s",
              }}
            />
          </div>

          <button
            onClick={onOpenHistory}
            className="btn-secondary"
            style={{ padding: "8px 14px", position: "relative" }}
          >
            <i className="bi bi-history" style={{ fontSize: "18px" }} /> Saved
            <span
              style={{
                background: "var(--primary-red)",
                color: "#ffffff",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "2px 7px",
                marginLeft: "4px",
              }}
            >
              {favoritesCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}