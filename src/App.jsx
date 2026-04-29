import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import DealsForm from './components/DealsForm';
import PaymentTracker from './components/PaymentTracker';
import Navigation from './components/Navigation';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'deals', label: 'Deals' },
  { id: 'payments', label: 'Payments' },
];

// Map page keys to page components so the root app shell stays simple.
const PAGE_COMPONENTS = {
  dashboard: <Dashboard />,
  deals: <DealsForm />,
  payments: <PaymentTracker />,
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsNavOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        onToggleNav={() => setIsNavOpen((open) => !open)}
        onCloseNav={() => setIsNavOpen(false)}
        onPageChange={handlePageChange}
        statusMessage="You are using an early release of Freelance CRM. Core features are live, and more improvements are on the way."
      />

      <main className="main-content">
        {PAGE_COMPONENTS[currentPage]}
      </main>
    </div>
  );
}

export default App;
