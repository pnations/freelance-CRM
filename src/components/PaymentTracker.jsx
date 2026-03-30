import React, { useState, useEffect } from 'react';
import { getPayments, getOrders, addPayment, deletePayment } from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import TableActions from './TableActions';
import useConfirmDelete from '../hooks/useConfirmDelete';
import useCrudForm from '../hooks/useCrudForm';
import '../styles/forms.css';

function PaymentTracker() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const {
    formData,
    setFormData,
    showForm,
    setShowForm,
    isSubmitting,
    setIsSubmitting,
    errorMessage,
    setErrorMessage,
    resetForm,
  } = useCrudForm(() => ({
    orderId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    hours: '',
    comment: '',
  }));

  const {
    deletingId: deletingPaymentId,
    confirmDeleteId: confirmDeletePaymentId,
    requestDelete,
    cancelDelete,
    confirmDelete: confirmDeletePayment,
  } = useConfirmDelete({
    execute: deletePayment,
    onSuccess: async () => {
      await loadData();
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to delete payment.');
    },
  });

  useEffect(() => {
    loadData();
  }, []);

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

  async function handleDeletePayment(id) {
    setErrorMessage('');
    requestDelete(id);
  }

  function getOrderInfo(orderId) {
    const order = orders.find((o) => o.id === orderId);
    return order ? { clientName: order.clientName, type: order.type, cost: order.cost } : { clientName: 'Unknown', type: 'Unknown', cost: 0 };
  }

  return (
    <div className="payment-tracker page-container">
      <div className="page-header">
        <h2 className="page-title">Payments & Hours</h2>
        <button
          type="button"
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

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
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
                    <td data-label="Order">{orderInfo.clientName} - {orderInfo.type}</td>
                    <td data-label="Amount">${Number(payment.amount || 0).toFixed(2)}</td>
                    <td data-label="Date">{payment.date}</td>
                    <td data-label="Method">{payment.method}</td>
                    <td data-label="Hours">{Number(payment.hours) > 0 ? Number(payment.hours) : '—'}</td>
                    <td data-label="Comment">{payment.comment || '—'}</td>
                    <td data-label="Actions" className="actions-cell">
                      <TableActions
                        onDelete={() => handleDeletePayment(payment.id)}
                        isDeleting={deletingPaymentId === payment.id}
                      />
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
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default PaymentTracker;
