import React, { useState, useEffect } from 'react';
import { getHours, getOrders, addHours, deleteHours } from '../services/dataService';
import '../styles/forms.css';

function HoursLogger() {
  const [hours, setHours] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const hoursData = await getHours();
    const ordersData = await getOrders();
    setHours(hoursData);
    setOrders(ordersData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.orderId && formData.hours && formData.date) {
      await addHours(
        formData.orderId,
        parseFloat(formData.hours),
        formData.date,
        formData.notes
      );
      resetForm();
      loadData();
    }
  }

  function resetForm() {
    setFormData({
      orderId: '',
      hours: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteHours(id);
      loadData();
    }
  }

  function getOrderInfo(orderId) {
    const order = orders.find((o) => o.id === orderId);
    return order ? `${order.clientName} - ${order.type}` : 'Unknown';
  }

  const totalHours = hours.reduce((total, h) => total + h.hours, 0);

  return (
    <div className="hours-logger">
      <div className="header">
        <h2>Hours</h2>
        <button
          className="btn-primary"
          onClick={() => {
            if (!showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Log Hours'}
        </button>
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Order</label>
            <select
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              required
            >
              <option value="">Select an order</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Hours</label>
            <input
              type="number"
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: e.target.value })
              }
              placeholder="0.5"
              step="0.5"
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="What did you work on?"
              rows="4"
            />
          </div>

          <button type="submit" className="btn-primary">
            Log Hours
          </button>
        </form>
      )}

      <div className="total-hours">
        Total Hours: {totalHours} hours
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Hours</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hours.length > 0 ? (
              hours.map((hour) => (
                <tr key={hour.id}>
                  <td>{getOrderInfo(hour.orderId)}</td>
                  <td>{hour.hours}</td>
                  <td>{hour.date}</td>
                  <td>{hour.notes}</td>
                  <td>
                    <button
                      className="btn-danger btn-small"
                      onClick={() => handleDelete(hour.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No hours logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HoursLogger;
