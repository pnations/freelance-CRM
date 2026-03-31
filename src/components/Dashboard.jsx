import React, { useState, useEffect } from 'react';
import { getOrders, getPayments } from '../services/dataService';
import '../styles/forms.css';
import '../styles/dashboard.css';

function Dashboard() {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, clientFilter, typeFilter]);

  async function loadData() {
    try {
      const ordersData = await getOrders();
      const paymentsData = await getPayments();

      setOrders(ordersData);
      setPayments(paymentsData);
      setErrorMessage('');
    } catch (error) {
      setOrders([]);
      setPayments([]);
      setErrorMessage(error.message || 'Failed to load dashboard data.');
    }
  }

  function applyFilters() {
    let filtered = orders;

    if (statusFilter !== 'All') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (clientFilter !== 'All') {
      filtered = filtered.filter((order) => order.clientName === clientFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((order) => order.type === typeFilter);
    }

    setFilteredOrders(filtered);
  }

  function getTotalRevenue() {
    return orders.reduce((total, order) => total + Number(order.cost), 0);
  }

  function getPaidRevenue() {
    return payments.reduce((total, payment) => total + Number(payment.amount), 0);
  }

  function getPendingPayments() {
    return getTotalRevenue() - getPaidRevenue();
  }

  function getTotalHours() {
    return payments.reduce((total, payment) => total + Number(payment.hours || 0), 0);
  }

  const statuses = ['All', 'Pending', 'In Progress', 'Completed', 'Invoiced', 'Paid'];
  const types = ['All', ...new Set(orders.map((o) => o.type))];
  const clientNames = ['All', ...new Set(orders.map((o) => o.clientName))];

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

      <div className="orders-table">
        <h3>Orders ({filteredOrders.length})</h3>
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                      <td data-label="Client">{order.clientName}</td>
                    <td data-label="Project Type">{order.type}</td>
                    <td data-label="Date Accepted">{order.dateAccepted}</td>
                    <td data-label="Status">
                      <span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td data-label="Project Cost">{currencyFormatter.format(Number(order.cost || 0))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No orders found
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
