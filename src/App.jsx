import React, { useState } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import OrderForm from './components/OrderForm';
import PaymentTracker from './components/PaymentTracker';
import { isSupabaseConfigured } from './services/supabase';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const isReadOnly = !isSupabaseConfigured;

  return (
    <div className="app">
      <div className="demo-banner">
        <span className="demo-badge">EARLY VERSION</span>
        <span className="demo-text">
          {isReadOnly
            ? 'Supabase is not configured. The app is currently read-only until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
            : 'You are using an early release of Freelance CRM. Core features are live, and more improvements are on the way.'}
        </span>
      </div>
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Freelance CRM</h1>
          
        </div>
        <ul className="nav-menu">
          <li>
            <button
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'clients' ? 'active' : ''}
              onClick={() => setCurrentPage('clients')}
            >
              Clients
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'orders' ? 'active' : ''}
              onClick={() => setCurrentPage('orders')}
            >
              Orders
            </button>
          </li>
          <li>
            <button
              className={currentPage === 'payments' ? 'active' : ''}
              onClick={() => setCurrentPage('payments')}
            >
              Payments
            </button>
          </li>
        </ul>
      </nav>

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
