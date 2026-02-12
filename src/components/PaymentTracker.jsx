import React, { useState, useEffect } from 'react';
import { getPayments, getOrders, addPayment, deletePayment } from '../services/dataService';
import '../styles/forms.css';

function PaymentTracker() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const paymentsData = await getPayments();
    const ordersData = await getOrders();
    setPayments(paymentsData);
    setOrders(ordersData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.orderId && formData.amount && formData.date) {
      await addPayment(
        formData.orderId,
        parseFloat(formData.amount),
        formData.date,
        formData.method
      );
      resetForm();
      loadData();
    }
  }

  function resetForm() {
    setFormData({
      orderId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'Bank Transfer',
    });
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      await deletePayment(id);
      loadData();
    }
  }

  function getOrderInfo(orderId) {
    const order = orders.find((o) => o.id === orderId);
    return order ? { clientName: order.clientName, type: order.type, cost: order.cost } : { clientName: 'Unknown', type: 'Unknown', cost: 0 };
  }

  return (
    <div className="payment-tracker">
      <div className="header">
        <h2>Payment Tracker</h2>
        <button
          className="btn-primary"
          onClick={() => {
            if (!showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Log Payment'}
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
                  {order.clientName} - {order.type} - ${order.cost}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount Paid</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Date</label>
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
            <label>Payment Method</label>
            <select
              value={formData.method}
              onChange={(e) =>
                setFormData({ ...formData, method: e.target.value })
              }
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Log Payment
          </button>
        </form>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => {
                const orderInfo = getOrderInfo(payment.orderId);
                return (
                  <tr key={payment.id}>
                    <td>{orderInfo.clientName} - {orderInfo.type}</td>
                    <td>${payment.amount.toFixed(2)}</td>
                    <td>{payment.date}</td>
                    <td>{payment.method}</td>
                    <td>
                      <button
                        className="btn-danger btn-small"
                        onClick={() => handleDelete(payment.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No payments logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentTracker;
