import React, { useEffect, useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import OrderForm from './components/OrderForm';
import PaymentTracker from './components/PaymentTracker';
import Navigation from './components/Navigation';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);

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
    <div className="app">
      <Navigation
        navItems={navItems}
        currentPage={currentPage}
        isNavOpen={isNavOpen}
        onToggleNav={() => setIsNavOpen((open) => !open)}
        onCloseNav={() => setIsNavOpen(false)}
        onPageChange={handlePageChange}
        statusMessage="You are using an early release of Freelance CRM. Core features are live, and more improvements are on the way."
      />

      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'clients' && <Clients />}
        {currentPage === 'orders' && <OrderForm />}
        {currentPage === 'payments' && <PaymentTracker />}
      </main>
    </div>
  );
}

export default App;
