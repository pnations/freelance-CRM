import React, { useState, useEffect } from 'react';
import { getPayments, getOrders, addPayment, deletePayment } from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import '../styles/forms.css';

function PaymentTracker({ readOnly = false }) {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState(null);
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState(null);
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    hours: '',
    comment: '',
  });

  useEffect(() => {
    if (readOnly) {
      setPayments([]);
      setOrders([]);
      setShowForm(false);
      return;
    }
    loadData();
  }, [readOnly]);

  async function loadData() {
    try {
      const paymentsData = await getPayments();
      const ordersData = await getOrders();
      setPayments(paymentsData);
      setOrders(ordersData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load payments.');
      setPayments([]);
      setOrders([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (readOnly) return;

    if (formData.orderId && formData.amount && formData.date) {
      setIsSubmitting(true);
      setErrorMessage('');
      try {
        await addPayment(
          formData.orderId,
          parseFloat(formData.amount),
          formData.date,
          formData.method,
          {
            hours: formData.hours ? parseFloat(formData.hours) : null,
            comment: formData.comment,
          }
        );
        resetForm();
        await loadData();
      } catch (error) {
        setErrorMessage(error.message || 'Failed to log payment.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function resetForm() {
    setFormData({
      orderId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'Bank Transfer',
      hours: '',
      comment: '',
    });
    setShowForm(false);
  }

  async function handleDeletePayment(id) {
    if (readOnly || deletingPaymentId) return;
    setConfirmDeletePaymentId(id);
  }

  async function confirmDeletePayment() {
    if (!confirmDeletePaymentId) return;

    const id = confirmDeletePaymentId;
    setDeletingPaymentId(id);
    setConfirmDeletePaymentId(null);
    setErrorMessage('');
    try {
      await deletePayment(id);
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete payment.');
    } finally {
      setDeletingPaymentId(null);
    }
  }

  function getOrderInfo(orderId) {
    const order = orders.find((o) => o.id === orderId);
    return order ? { clientName: order.clientName, type: order.type, cost: order.cost } : { clientName: 'Unknown', type: 'Unknown', cost: 0 };
  }

  return (
    <div className="payment-tracker">
      <div className="header">
        <h2>Payments & Hours</h2>
        <button
          type="button"
          className="btn-primary"
          disabled={readOnly}
          onClick={() => {
            if (readOnly) return;
            if (!showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Cancel' : 'Log Payment'}
        </button>
      </div>

      {readOnly && <p className="readonly-note">Read-only mode: configure Supabase credentials to enable creating, editing, and deleting records.</p>}
      {errorMessage && <p className="error-banner">{errorMessage}</p>}

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

          <div className="form-group">
            <label>Hours (optional)</label>
            <input
              type="number"
              value={formData.hours}
              onChange={(e) =>
                setFormData({ ...formData, hours: e.target.value })
              }
              placeholder="0.0"
              step="0.25"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Comment (optional)</label>
            <textarea
              value={formData.comment}
              onChange={(e) =>
                setFormData({ ...formData, comment: e.target.value })
              }
              placeholder="Add context for this payment or hours log"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={readOnly || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Log Payment'}
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
              <th>Hours</th>
              <th>Comment</th>
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
                    <td>${Number(payment.amount || 0).toFixed(2)}</td>
                    <td>{payment.date}</td>
                    <td>{payment.method}</td>
                    <td>{Number(payment.hours) > 0 ? Number(payment.hours) : '—'}</td>
                    <td>{payment.comment || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-danger btn-small"
                        disabled={readOnly || deletingPaymentId === payment.id}
                        onClick={() => handleDeletePayment(payment.id)}
                      >
                        {deletingPaymentId === payment.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  No payments logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDeletePaymentId)}
        title="Delete payment"
        message="This payment record will be permanently removed."
        confirmLabel="Delete payment"
        danger
        onConfirm={confirmDeletePayment}
        onCancel={() => setConfirmDeletePaymentId(null)}
      />
    </div>
  );
}

export default PaymentTracker;
