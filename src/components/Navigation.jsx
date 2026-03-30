import React from 'react';

function Navigation({
  navItems,
  currentPage,
  isNavOpen,
  onToggleNav,
  onCloseNav,
  onPageChange,
  statusMessage,
}) {
  return (
    <>
      <div className="demo-banner">
        <button
          type="button"
          className="hamburger-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isNavOpen}
          onClick={onToggleNav}
        >
          <span />
          <span />
          <span />
        </button>
        <span className="demo-badge">EARLY VERSION</span>
        <span className="demo-text" role="status">{statusMessage}</span>
      </div>

      <button
        type="button"
        className={`nav-overlay ${isNavOpen ? 'open' : ''}`}
        aria-label="Close navigation menu"
        onClick={onCloseNav}
      />

      <nav className={`sidebar ${isNavOpen ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="sidebar-header">
          <h1>Freelance CRM</h1>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation menu"
            onClick={onCloseNav}
          >
            Close
          </button>
        </div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={currentPage === item.id ? 'active' : ''}
                onClick={() => onPageChange(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default Navigation;
