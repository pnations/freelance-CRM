import React, { useState, useEffect } from 'react';
import { getDeals, getPayments } from '../services/dataService';
import '../styles/base.css';
import '../styles/tables.css';
import '../styles/panels.css';

function Dashboard() {
  // Standard formatter used across the dashboard for revenues and costs.
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Raw API data loaded from Supabase.
  const [deals, setDeals] = useState([]);
  const [payments, setPayments] = useState([]);

  // Filtered results shown in the dashboard table.
  const [filteredDeals, setFilteredDeals] = useState([]);

  // UI filter state for the dashboard controls.
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load fresh dashboard data when the page mounts.
    loadData();

    // Auto-refresh every 30 seconds so summary metrics stay current.
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Re-run filter logic whenever deals or filter controls change.
    applyFilters();
  }, [deals, statusFilter, clientFilter, typeFilter]);

  async function loadData() {
    try {
      const dealsData = await getDeals();
      const paymentsData = await getPayments();

      setDeals(dealsData);
      setPayments(paymentsData);
      setErrorMessage('');
    } catch (error) {
      setDeals([]);
      setPayments([]);
      setErrorMessage(error.message || 'Failed to load dashboard data.');
    }
  }

  function applyFilters() {
    // Apply the dashboard filters in a predictable order.
    let filtered = deals;

    if (statusFilter !== 'All') {
      filtered = filtered.filter((deal) => deal.status === statusFilter);
    }

    if (clientFilter !== 'All') {
      filtered = filtered.filter((deal) => deal.clientName === clientFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((deal) => deal.type === typeFilter);
    }

    setFilteredDeals(filtered);
  }

  // Derived values used by the top-level metric cards.
  function getTotalRevenue() {
    return deals.reduce((total, deal) => total + Number(deal.cost), 0);
  }

  function getPaidRevenue() {
    return payments.reduce((total, payment) => total + Number(payment.amount), 0);
  }

  function getPendingPayments() {
    // Pending payments are the remaining amount from total deals minus collected payments.
    return getTotalRevenue() - getPaidRevenue();
  }

  function getTotalHours() {
    return payments.reduce((total, payment) => total + Number(payment.hours || 0), 0);
  }

  // Filter options for the dashboard controls.
  const statuses = ['All', 'Pending', 'In Progress', 'Completed', 'Invoiced', 'Paid'];
  const types = ['All', ...new Set(deals.map((d) => d.type))];
  const clientNames = ['All', ...new Set(deals.map((d) => d.clientName))];

  return (
    <div className="dashboard page-container">
      <h2 className="page-title">Dashboard Overview</h2>
      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      <div className="metrics">
        <div className="metric-card">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">{currencyFormatter.format(getTotalRevenue())}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Paid Revenue</div>
          <div className="metric-value">{currencyFormatter.format(getPaidRevenue())}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Pending Payments</div>
          <div className="metric-value">{currencyFormatter.format(getPendingPayments())}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Hours</div>
          <div className="metric-value">{getTotalHours()}</div>
        </div>
      </div>

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            {clientNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="deals-table">
        <h3>Deals ({filteredDeals.length})</h3>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project Type</th>
                <th>Date Accepted</th>
                <th>Status</th>
                <th>Project Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length > 0 ? (
                filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                      <td data-label="Client">{deal.clientName}</td>
                    <td data-label="Project Type">{deal.type}</td>
                    <td data-label="Date Accepted">{deal.dateAccepted}</td>
                    <td data-label="Status">
                      <span className={`status-badge status-${deal.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td data-label="Project Cost">{currencyFormatter.format(Number(deal.cost || 0))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No deals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
