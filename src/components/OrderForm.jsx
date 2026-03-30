import React, { useState, useEffect } from 'react';
import { getOrders, addOrder, updateOrder, deleteOrder } from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import TableActions from './TableActions';
import useConfirmDelete from '../hooks/useConfirmDelete';
import useCrudForm from '../hooks/useCrudForm';
import '../styles/forms.css';

function OrderForm({ readOnly = false }) {
  const [orders, setOrders] = useState([]);
  const {
    formData,
    setFormData,
    showForm,
    setShowForm,
    editingId,
    setEditingId,
    isSubmitting,
    setIsSubmitting,
    errorMessage,
    setErrorMessage,
    resetForm,
  } = useCrudForm(() => ({
    clientName: '',
    type: '',
    dateAccepted: '',
    status: 'Pending',
    cost: '',
  }));

  const {
    deletingId,
    confirmDeleteId,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useConfirmDelete({
    execute: deleteOrder,
    onSuccess: async () => {
      await loadData();
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to delete order.');
    },
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

  function handleEdit(order) {
    if (readOnly) return;
    setFormData(order);
    setEditingId(order.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (readOnly) return;
    setErrorMessage('');
    requestDelete(id);
  }

  return (
    <div className="order-form page-container">
      <div className="page-header">
        <h2 className="page-title">Orders</h2>
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
                  <td data-label="Client">{order.clientName}</td>
                  <td data-label="Type">{order.type}</td>
                  <td data-label="Date Accepted">{order.dateAccepted}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td data-label="Cost">${Number(order.cost || 0).toFixed(2)}</td>
                  <td data-label="Actions" className="actions-cell">
                    <TableActions
                      onEdit={() => handleEdit(order)}
                      onDelete={() => handleDelete(order.id)}
                      readOnly={readOnly}
                      isDeleting={deletingId === order.id}
                    />
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
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default OrderForm;
