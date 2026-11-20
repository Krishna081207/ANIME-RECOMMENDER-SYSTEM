import React from "react";
import { BookmarkCheck, Clapperboard, Search, Sparkles, LibraryBig } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const pages = [
  { path: "/", name: "Discover", Icon: Clapperboard },
  { path: "/personalized", name: "My Picks", Icon: Sparkles },
  { path: "/library", name: "My Library", Icon: LibraryBig }
];

export default function Navbar({ searchQuery, setSearchQuery, favoritesCount, onOpenHistory }) {
  const navigate = useNavigate();
  const location = useLocation();

  function searchCatalog(event) {
    setSearchQuery(event.target.value);
    if (location.pathname !== "/") navigate("/");
  }

  return (
    <header className="site-header">
      <div className="site-header-content">
        <Link to="/" className="site-brand" aria-label="CineMatch Anime home">
          <span className="brand-icon"><Clapperboard size={21} aria-hidden="true" /></span>
          <span>CineMatch <small>Anime</small></span>
        </Link>
        <nav className="site-tabs" aria-label="Main navigation">
          {pages.map(({ path, name, Icon }) => (
            <NavLink key={path} to={path} end>
              <Icon size={15} aria-hidden="true" /> {name}
            </NavLink>
          ))}
        </nav>
        <div className="site-actions">
          <label className="catalog-search">
            <Search size={17} aria-hidden="true" />
            <input type="search" aria-label="Search anime titles" placeholder="Search anime" value={searchQuery} onChange={searchCatalog} />
          </label>
          <button className="btn-secondary saved-trigger" onClick={onOpenHistory}>
            <BookmarkCheck size={16} aria-hidden="true" /> Saved <span>{favoritesCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
