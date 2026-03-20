import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import OrderForm from './components/OrderForm';
import PaymentTracker from './components/PaymentTracker';
import HoursLogger from './components/HoursLogger';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  

  return (
    <div className="app">
      <div className="demo-banner">
        <span className="demo-badge">EARLY VERSION</span>
        <span className="demo-text">You are using an early release of Freelance CRM. Core features are live, and more improvements are on the way.</span>
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
          <li>
            <button
              className={currentPage === 'hours' ? 'active' : ''}
              onClick={() => setCurrentPage('hours')}
            >
              Hours
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'clients' && <Clients />}
        {currentPage === 'orders' && <OrderForm />}
        {currentPage === 'payments' && <PaymentTracker />}
        {currentPage === 'hours' && <HoursLogger />}
      </main>
    </div>
  );
}

export default App;
