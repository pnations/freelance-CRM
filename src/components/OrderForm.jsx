import React, { useState, useEffect } from 'react';
import { getOrders, addOrder, updateOrder, deleteOrder } from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import '../styles/forms.css';

function OrderForm({ readOnly = false }) {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    type: '',
    dateAccepted: '',
    status: 'Pending',
    cost: '',
  });

  useEffect(() => {
    if (readOnly) {
      setOrders([]);
      setShowForm(false);
      setEditingId(null);
      return;
    }
    loadData();
  }, [readOnly]);

  async function loadData() {
    try {
      const ordersData = await getOrders();
      setOrders(ordersData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load orders.');
      setOrders([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (readOnly) return;

    if (formData.clientName && formData.type && formData.dateAccepted && formData.cost) {
      setIsSubmitting(true);
      setErrorMessage('');
      try {
        if (editingId) {
          await updateOrder(
            editingId,
            formData.clientName,
            formData.type,
            formData.dateAccepted,
            formData.status,
            parseFloat(formData.cost)
          );
          setEditingId(null);
        } else {
          await addOrder(
            formData.clientName,
            formData.type,
            formData.dateAccepted,
            formData.status,
            parseFloat(formData.cost)
          );
        }
        resetForm();
        await loadData();
      } catch (error) {
        setErrorMessage(error.message || 'Failed to save order.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function resetForm() {
    setFormData({
      clientName: '',
      type: '',
      dateAccepted: '',
      status: 'Pending',
      cost: '',
    });
    setShowForm(false);
  }

  function handleEdit(order) {
    if (readOnly) return;
    setFormData(order);
    setEditingId(order.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (readOnly || deletingId) return;
    setConfirmDeleteId(id);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;

    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);
    setErrorMessage('');
    try {
      await deleteOrder(id);
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete order.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="order-form">
      <div className="header">
        <h2>Orders</h2>
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
          {showForm ? 'Cancel' : 'Add Order'}
        </button>
      </div>

      {readOnly && <p className="readonly-note">Read-only mode: configure Supabase credentials to enable creating, editing, and deleting records.</p>}
      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="form-group">
            <label>Project Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              placeholder="e.g., Web Development"
              required
            />
          </div>

          <div className="form-group">
            <label>Date Accepted</label>
            <input
              type="date"
              value={formData.dateAccepted}
              onChange={(e) =>
                setFormData({ ...formData, dateAccepted: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Invoiced">Invoiced</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div className="form-group">
            <label>Project Cost</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: e.target.value })
              }
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={readOnly || isSubmitting}>
            {isSubmitting ? 'Saving...' : editingId ? 'Update Order' : 'Add Order'}
          </button>
        </form>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Type</th>
              <th>Date Accepted</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.clientName}</td>
                  <td>{order.type}</td>
                  <td>{order.dateAccepted}</td>
                  <td>
                    <span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>${Number(order.cost || 0).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      disabled={readOnly || deletingId === order.id}
                      onClick={() => handleEdit(order)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger btn-small"
                      disabled={readOnly || deletingId === order.id}
                      onClick={() => handleDelete(order.id)}
                    >
                      {deletingId === order.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No orders yet. Create one to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="Delete order"
        message="This will permanently delete the order and any related payments and hours."
        confirmLabel="Delete order"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}

export default OrderForm;
