import React, { useState, useEffect } from 'react';
import { getDeals, addDeal, updateDeal, deleteDeal } from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import TableActions from './TableActions';
import useConfirmDelete from '../hooks/useConfirmDelete';
import useCrudForm from '../hooks/useCrudForm';
import '../styles/base.css';
import '../styles/tables.css';

function DealsForm() {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function normalizeCostInput(value) {
    const cleaned = String(value ?? '').replace(/[^\d.,]/g, '').replace(/,/g, '');
    const [whole = '', ...fractionParts] = cleaned.split('.');
    const fraction = fractionParts.join('');

    return fractionParts.length > 0 ? `${whole}.${fraction}` : whole;
  }

  function parseCostValue(value) {
    const normalized = normalizeCostInput(value);
    if (!normalized) {
      return NaN;
    }

    return Number(normalized);
  }

  function formatCostForDisplay(value) {
    const amount = parseCostValue(value);
    if (!Number.isFinite(amount)) {
      return '';
    }

    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    clientContactPerson: '',
    clientEmail: '',
    clientPhone: '',
    clientNotes: '',
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
    execute: deleteDeal,
    onSuccess: async () => {
      await loadData();
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to delete deal.');
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const dealsData = await getDeals();
      setDeals(dealsData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load deals.');
      setDeals([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const parsedCost = parseCostValue(formData.cost);

    if (
      formData.clientName.trim()
      && formData.clientContactPerson.trim()
      && formData.type.trim()
      && formData.dateAccepted
      && Number.isFinite(parsedCost)
    ) {
      setIsSubmitting(true);
      setErrorMessage('');
      try {
        if (editingId) {
          await updateDeal(
            editingId,
            formData.clientName,
            formData.clientContactPerson,
            formData.clientEmail,
            formData.clientPhone,
            formData.clientNotes,
            formData.type,
            formData.dateAccepted,
            formData.status,
            parsedCost
          );
          setEditingId(null);
        } else {
          await addDeal(
            formData.clientName,
            formData.clientContactPerson,
            formData.clientEmail,
            formData.clientPhone,
            formData.clientNotes,
            formData.type,
            formData.dateAccepted,
            formData.status,
            parsedCost
          );
        }
        resetForm();
        await loadData();
      } catch (error) {
        setErrorMessage(error.message || 'Failed to save deal.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrorMessage('Please complete all required fields with valid values.');
    }
  }

  function handleEdit(deal) {
    setFormData({
      clientName: deal.clientName || '',
      clientContactPerson: deal.clientContactPerson || '',
      clientEmail: deal.clientEmail || '',
      clientPhone: deal.clientPhone || '',
      clientNotes: deal.clientNotes || '',
      type: deal.type || '',
      dateAccepted: deal.dateAccepted || '',
      status: deal.status || 'Pending',
      cost: formatCostForDisplay(deal.cost),
    });
    setEditingId(deal.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    setErrorMessage('');
    requestDelete(id);
  }

  function getFilteredDeals() {
    if (!searchQuery.trim()) {
      return deals;
    }

    const query = searchQuery.toLowerCase();
    return deals.filter((deal) =>
      deal.clientName?.toLowerCase().includes(query)
      || deal.clientContactPerson?.toLowerCase().includes(query)
      || deal.type?.toLowerCase().includes(query)
      || deal.status?.toLowerCase().includes(query)
      || deal.dateAccepted?.toLowerCase().includes(query)
      || deal.clientEmail?.toLowerCase().includes(query)
      || deal.clientPhone?.toLowerCase().includes(query)
      || deal.clientNotes?.toLowerCase().includes(query)
    );
  }

  const filteredDeals = getFilteredDeals();

  return (
    <div className="deals-form page-container">
      <div className="page-header">
        <h2 className="page-title">Deals</h2>
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
          {showForm ? 'Cancel' : 'Add Deal'}
        </button>
      </div>

      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      {!showForm && (
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Person *</label>
            <input
              type="text"
              value={formData.clientContactPerson}
              onChange={(e) => setFormData({ ...formData, clientContactPerson: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Project Type *</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Project Cost *</label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: normalizeCostInput(e.target.value) })
              }
              onFocus={() =>
                setFormData({ ...formData, cost: normalizeCostInput(formData.cost) })
              }
              onBlur={() =>
                setFormData({
                  ...formData,
                  cost: formatCostForDisplay(formData.cost),
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Date Accepted *</label>
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
            <label>Email</label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Deal Notes</label>
            <textarea
              value={formData.clientNotes}
              onChange={(e) => setFormData({ ...formData, clientNotes: e.target.value })}
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editingId ? 'Update Deal' : 'Add Deal'}
          </button>
        </form>
      )}

      {!showForm && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project Type</th>
                <th>Date Accepted</th>
                <th>Status</th>
                <th>Project Cost</th>
                <th>Actions</th>
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
                    <td data-label="Actions" className="actions-cell">
                      <TableActions
                        onEdit={() => handleEdit(deal)}
                        onDelete={() => handleDelete(deal.id)}
                        isDeleting={deletingId === deal.id}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {searchQuery ? 'No deals match your search.' : 'No deals yet. Create one to get started!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="Delete deal"
        message="This will permanently delete the deal and any related payments."
        confirmLabel="Delete deal"
        danger
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

export default DealsForm;
