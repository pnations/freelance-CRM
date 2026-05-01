import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import DealsForm from './components/DealsForm';
import PaymentTracker from './components/PaymentTracker';
import Navigation from './components/Navigation';

// Navigation items config — drives both the nav menu order and labels.
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'deals', label: 'Deals' },
  { id: 'payments', label: 'Payments' },
];

// Map page keys to page components so the root app shell stays simple.
// To add a new page, register it here and in NAV_ITEMS above.
const PAGE_COMPONENTS = {
  dashboard: <Dashboard />,
  deals: <DealsForm />,
  payments: <PaymentTracker />,
};

function App() {
  // Tracks which top-level page is currently rendered in the main content area.
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Controls the open/closed state of the mobile navigation drawer.
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Close the nav drawer when the user presses Escape.
  // The listener is attached to the window so it works regardless of focus.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsNavOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    // Clean up the listener when the component unmounts to avoid memory leaks.
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty dependency array — register once on mount.

  // Switches the active page and ensures the nav drawer closes after selection.
  function handlePageChange(pageId) {
    setCurrentPage(pageId);
    setIsNavOpen(false);
  }

  return (
    <div className="app">
      <Navigation
        navItems={NAV_ITEMS}
        currentPage={currentPage}
        isNavOpen={isNavOpen}
        onToggleNav={() => setIsNavOpen((open) => !open)} // Flip drawer open/closed
        onCloseNav={() => setIsNavOpen(false)}            // Explicit close (e.g. overlay click)
        onPageChange={handlePageChange}
        statusMessage="You are using an early release of Freelance CRM. Core features are live, and more improvements are on the way."
      />

      {/* Render only the active page — other components are not mounted. */}
      <main className="main-content">
        {PAGE_COMPONENTS[currentPage]}
      </main>
    </div>
  );
}

export default App;