import { useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, Package, Search, ShoppingBag, UserRound, X } from "lucide-react";

import Container from "./Container";
import { useAuth } from "../context/AuthContext";

const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
  "esh-nav-link" + (isActive ? " esh-nav-link--active" : "");

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const signedInUser = isAuthenticated ? user : null;

  const closeMenus = () => {
    setMobileOpen(false);
    setSearchOpen(false);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchText.trim();
    navigate(term ? "/products?q=" + encodeURIComponent(term) : "/products");
    closeMenus();
  };

  return (
    <header className="esh-site-header">
      <div className="esh-utility-bar">
        <Container className="esh-utility-bar__inner">
          <span>Thoughtfully curated. Made for your everyday.</span>
          <div className="esh-utility-bar__links">
            {signedInUser ? <Link to="/orders" onClick={closeMenus}>Your orders</Link> : <Link to="/register" onClick={closeMenus}>Create an account</Link>}
            <span aria-hidden="true">•</span>
            <span>Prices in TZS</span>
          </div>
        </Container>
      </div>

      <nav className="esh-header-main" aria-label="Primary navigation">
        <Container className="esh-header-main__inner">
          <Link to="/" className="esh-brand" onClick={closeMenus} aria-label="E-Shop home">E-Shop<span className="esh-brand__dot">.</span></Link>

          <div className="esh-desktop-nav">
            <NavLink to="/" end className={desktopNavClass}>Home</NavLink>
            <NavLink to="/products" className={desktopNavClass}>The collection</NavLink>
            {signedInUser && <NavLink to="/orders" className={desktopNavClass}>My orders</NavLink>}
            {user?.role === "ADMIN" && <NavLink to="/admin" className={desktopNavClass}>Admin</NavLink>}
          </div>

          <div className="esh-header-actions">
            <button
              type="button"
              className="esh-header-icon"
              aria-label={searchOpen ? "Close search" : "Search products"}
              aria-expanded={searchOpen}
              aria-controls="esh-site-search"
              onClick={() => { setSearchOpen((value) => !value); setMobileOpen(false); }}
            >
              {searchOpen ? <X size={21} /> : <Search size={21} />}
            </button>
            <Link to="/cart" className="esh-header-icon" aria-label="Shopping cart" onClick={closeMenus} title="Shopping cart">
              <ShoppingBag size={21} />
            </Link>
            {signedInUser ? (
              <button type="button" onClick={() => { logout(); closeMenus(); }} className="esh-header-icon esh-account-icon" aria-label="Sign out" title="Sign out">
                <LogOut size={21} />
              </button>
            ) : (
              <Link to="/login" className="esh-header-icon esh-account-icon" aria-label="Sign in" title="Sign in" onClick={closeMenus}>
                <UserRound size={21} />
              </Link>
            )}
            <button
              type="button"
              className="esh-header-icon esh-mobile-menu-button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="esh-mobile-navigation"
              onClick={() => { setMobileOpen((value) => !value); setSearchOpen(false); }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </Container>
      </nav>

      <div id="esh-site-search" className="esh-search-panel" hidden={!searchOpen}>
        <Container>
          <form onSubmit={submitSearch} className="esh-search-panel__form" role="search" aria-label="Product search">
            <Search size={20} aria-hidden="true" />
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} type="search" aria-label="Search the collection" placeholder="Search the collection…" />
            <button type="submit">Search <span aria-hidden="true">↗</span></button>
          </form>
        </Container>
      </div>

      <div id="esh-mobile-navigation" className="esh-mobile-nav" hidden={!mobileOpen}>
        <Container>
          <NavLink to="/" end onClick={closeMenus} className={desktopNavClass}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenus} className={desktopNavClass}>The collection</NavLink>
          {signedInUser && <NavLink to="/orders" onClick={closeMenus} className={desktopNavClass}><Package size={18} /> My orders</NavLink>}
          {user?.role === "ADMIN" && <NavLink to="/admin" onClick={closeMenus} className={desktopNavClass}>Admin</NavLink>}
          {!signedInUser && <NavLink to="/login" onClick={closeMenus} className={desktopNavClass}>Sign in</NavLink>}
        </Container>
      </div>
    </header>
  );
}

export default Navbar;
