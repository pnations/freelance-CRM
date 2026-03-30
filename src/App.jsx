import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import OrderForm from './components/OrderForm';
import PaymentTracker from './components/PaymentTracker';
import Navigation from './components/Navigation';
import { isSupabaseConfigured } from './services/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const isReadOnly = !isSupabaseConfigured;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'clients', label: 'Clients' },
    { id: 'orders', label: 'Orders' },
    { id: 'payments', label: 'Payments' },
  ];

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
    <div className={`app ${isNavOpen ? 'nav-open' : ''}`}>
      <Navigation
        navItems={navItems}
        currentPage={currentPage}
        isNavOpen={isNavOpen}
        onToggleNav={() => setIsNavOpen((open) => !open)}
        onCloseNav={() => setIsNavOpen(false)}
        onPageChange={handlePageChange}
      />

      <div className="demo-status-message" role="status">
        {isReadOnly
          ? 'Supabase is not configured. The app is currently read-only until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
          : 'You are using an early release of Freelance CRM. Core features are live, and more improvements are on the way.'}
      </div>

      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard readOnly={isReadOnly} />}
        {currentPage === 'clients' && <Clients readOnly={isReadOnly} />}
        {currentPage === 'orders' && <OrderForm readOnly={isReadOnly} />}
        {currentPage === 'payments' && <PaymentTracker readOnly={isReadOnly} />}
      </main>
    </div>
  );
}

export default App;
