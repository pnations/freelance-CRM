import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  getPayments,
  getDeals,
  addPayment,
  updatePayment,
  deletePayment,
} from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import InvoicePreviewModal from './InvoicePreviewModal';
import useConfirmDelete from '../hooks/useConfirmDelete';
import useCrudForm from '../hooks/useCrudForm';
import '../styles/base.css';
import '../styles/tables.css';

function PaymentTracker() {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [payments, setPayments] = useState([]);
  const [deals, setDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPaymentDraft, setEditingPaymentDraft] = useState(null);
  const [savingPaymentId, setSavingPaymentId] = useState(null);
  const [invoiceDealId, setInvoiceDealId] = useState(null);
  const [actionsMenu, setActionsMenu] = useState(null);
  const menuItemRefs = useRef([]);
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

  useEffect(() => {
    function closeMenu() {
      setActionsMenu(null);
    }

    function handleDocumentClick(event) {
      if (event.target.closest('.actions-dropdown-menu-floating') || event.target.closest('.actions-menu-trigger')) {
        return;
      }
      closeMenu();
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    }

    if (actionsMenu) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', closeMenu);
      window.addEventListener('scroll', closeMenu, true);
      return () => {
        document.removeEventListener('mousedown', handleDocumentClick);
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('resize', closeMenu);
        window.removeEventListener('scroll', closeMenu, true);
      };
    }

    return undefined;
  }, [actionsMenu]);

  useEffect(() => {
    if (!actionsMenu) {
      return;
    }

    menuItemRefs.current[0]?.focus();
  }, [actionsMenu]);

  async function loadData() {
    try {
      const paymentsData = await getPayments();
      const dealsData = await getDeals();
      setPayments(paymentsData);
      setDeals(dealsData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load payments.');
      setPayments([]);
      setDeals([]);
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

  function normalizeId(value) {
    return String(value ?? '');
  }

  function getPaymentsForDeal(dealId) {
    const normalizedDealId = normalizeId(dealId);
    return payments.filter((payment) => normalizeId(payment.orderId) === normalizedDealId);
  }

  function getDealInfo(orderId) {
    const normalizedOrderId = normalizeId(orderId);
    const deal = deals.find((d) => normalizeId(d.id) === normalizedOrderId);
    return deal ? { clientName: deal.clientName, type: deal.type, cost: deal.cost } : { clientName: 'Unknown', type: 'Unknown', cost: 0 };
  }

  function openInvoice(dealId) {
    const normalizedDealId = normalizeId(dealId);
    const deal = deals.find((d) => normalizeId(d.id) === normalizedDealId);
    if (!deal) {
      setErrorMessage('Unable to generate invoice. Deal record not found.');
      return;
    }
    setInvoiceDealId(normalizedDealId);
  }

  function closeInvoice() {
    setInvoiceDealId(null);
  }

  function startEditPayment(payment) {
    setEditingPaymentId(payment.id);
    setEditingPaymentDraft({
      orderId: normalizeId(payment.orderId),
      amount: String(payment.amount ?? ''),
      date: payment.date || '',
      method: payment.method || 'Bank Transfer',
      hours: payment.hours == null ? '' : String(payment.hours),
      comment: payment.comment || '',
    });
    setActionsMenu(null);
  }

  function cancelEditPayment() {
    setEditingPaymentId(null);
    setEditingPaymentDraft(null);
  }

  function updateEditDraft(field, value) {
    setEditingPaymentDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveEditPayment(paymentId) {
    if (!editingPaymentDraft) {
      return;
    }

    const amount = Number(editingPaymentDraft.amount);
    const hoursValue = editingPaymentDraft.hours === '' ? null : Number(editingPaymentDraft.hours);
    if (!editingPaymentDraft.orderId || !editingPaymentDraft.date || !editingPaymentDraft.method || !Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('Please provide a valid deal, amount, date, and method before saving.');
      return;
    }
    if (hoursValue != null && (!Number.isFinite(hoursValue) || hoursValue < 0)) {
      setErrorMessage('Hours must be blank or a non-negative number.');
      return;
    }

    setSavingPaymentId(paymentId);
    setErrorMessage('');
    try {
      await updatePayment(
        paymentId,
        editingPaymentDraft.orderId,
        amount,
        editingPaymentDraft.date,
        editingPaymentDraft.method,
        {
          hours: hoursValue,
          comment: editingPaymentDraft.comment,
        }
      );
      cancelEditPayment();
      setActionsMenu(null);
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update payment.');
    } finally {
      setSavingPaymentId(null);
    }
  }

  function getFilteredPayments() {
    if (!searchQuery.trim()) {
      return payments;
    }

    const query = searchQuery.toLowerCase();
    return payments.filter((payment) => {
      const dealInfo = getDealInfo(payment.orderId);
      const amountText = String(payment.amount ?? '').toLowerCase();
      const hoursText = String(payment.hours ?? '').toLowerCase();

      return (
        dealInfo.clientName.toLowerCase().includes(query)
        || dealInfo.type.toLowerCase().includes(query)
        || String(payment.date ?? '').toLowerCase().includes(query)
        || String(payment.method ?? '').toLowerCase().includes(query)
        || String(payment.comment ?? '').toLowerCase().includes(query)
        || amountText.includes(query)
        || hoursText.includes(query)
      );
    });
  }

  const filteredPayments = getFilteredPayments();
  const hasActiveEdit = Boolean(editingPaymentId);
  const menuPayment = actionsMenu ? payments.find((payment) => payment.id === actionsMenu.paymentId) : null;
  const selectedInvoiceDeal = invoiceDealId
    ? deals.find((deal) => normalizeId(deal.id) === normalizeId(invoiceDealId))
    : null;
  const invoicePayments = selectedInvoiceDeal ? getPaymentsForDeal(selectedInvoiceDeal.id) : [];

  function toggleActionsMenu(event, payment) {
    if (actionsMenu?.paymentId === payment.id) {
      setActionsMenu(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 170;
    const menuHeight = 140;
    const viewportPadding = 8;
    const maxLeft = window.innerWidth - menuWidth - viewportPadding;
    const left = Math.min(maxLeft, Math.max(viewportPadding, rect.right - menuWidth));

    let top = rect.bottom + 6;
    if (top + menuHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, rect.top - menuHeight - 6);
    }

    setActionsMenu({
      paymentId: payment.id,
      orderId: payment.orderId,
      top,
      left,
      triggerId: `payment-actions-trigger-${payment.id}`,
    });
  }

  function closeActionsMenu(returnFocus = false) {
    const triggerId = actionsMenu?.triggerId;
    setActionsMenu(null);
    if (returnFocus && triggerId) {
      window.requestAnimationFrame(() => {
        document.getElementById(triggerId)?.focus();
      });
    }
  }

  function handleActionsMenuKeyDown(event) {
    const enabledItems = menuItemRefs.current.filter(Boolean);
    if (!enabledItems.length) {
      return;
    }

    const currentIndex = enabledItems.indexOf(document.activeElement);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeActionsMenu(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = (safeIndex + 1) % enabledItems.length;
      enabledItems[nextIndex].focus();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = (safeIndex - 1 + enabledItems.length) % enabledItems.length;
      enabledItems[nextIndex].focus();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      enabledItems[0].focus();
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      enabledItems[enabledItems.length - 1].focus();
    }
  }

  return (
    <div className="payment-tracker page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Payments & Hours</h2>
          {hasActiveEdit && (
            <p className="hint-text">Editing payment - save or cancel changes to continue.</p>
          )}
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (!showForm) {
              resetForm();
            }
            setShowForm(!showForm);
          }}
          disabled={hasActiveEdit}
        >
          {showForm ? 'Cancel' : 'Log Payment'}
        </button>
      </div>

      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      {!showForm && (
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deal</label>
            <select
              value={formData.orderId}
              onChange={(e) =>
                setFormData({ ...formData, orderId: e.target.value })
              }
              required
            >
              <option value="">Select a deal</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.clientName} - {deal.type} - {currencyFormatter.format(Number(deal.cost || 0))}
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

      {!showForm && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Hours</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const dealInfo = getDealInfo(payment.orderId);
                  const isEditing = editingPaymentId === payment.id;
                  const isSaving = savingPaymentId === payment.id;
                  const disableRowActions = hasActiveEdit && !isEditing;
                  const isActionsExpanded = actionsMenu?.paymentId === payment.id;
                  return (
                    <tr key={payment.id}>
                      <td data-label="Deal">
                        {isEditing ? (
                          <select
                            value={editingPaymentDraft?.orderId || ''}
                            onChange={(event) => updateEditDraft('orderId', event.target.value)}
                          >
                            <option value="">Select a deal</option>
                            {deals.map((deal) => (
                              <option key={deal.id} value={String(deal.id)}>
                                {deal.clientName} - {deal.type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <>{dealInfo.clientName} - {dealInfo.type}</>
                        )}
                      </td>
                      <td data-label="Amount">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editingPaymentDraft?.amount || ''}
                            onChange={(event) => updateEditDraft('amount', event.target.value)}
                          />
                        ) : (
                          currencyFormatter.format(Number(payment.amount || 0))
                        )}
                      </td>
                      <td data-label="Date">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editingPaymentDraft?.date || ''}
                            onChange={(event) => updateEditDraft('date', event.target.value)}
                          />
                        ) : (
                          payment.date
                        )}
                      </td>
                      <td data-label="Method">
                        {isEditing ? (
                          <select
                            value={editingPaymentDraft?.method || 'Bank Transfer'}
                            onChange={(event) => updateEditDraft('method', event.target.value)}
                          >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="PayPal">PayPal</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Check">Check</option>
                            <option value="Cash">Cash</option>
                          </select>
                        ) : (
                          payment.method
                        )}
                      </td>
                      <td data-label="Hours">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            value={editingPaymentDraft?.hours || ''}
                            onChange={(event) => updateEditDraft('hours', event.target.value)}
                            placeholder="0.0"
                          />
                        ) : (
                          Number(payment.hours) > 0 ? Number(payment.hours) : '—'
                        )}
                      </td>
                      <td data-label="Comment">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingPaymentDraft?.comment || ''}
                            onChange={(event) => updateEditDraft('comment', event.target.value)}
                            placeholder="Optional note"
                          />
                        ) : (
                          payment.comment || '—'
                        )}
                      </td>
                      <td data-label="Actions" className="actions-cell">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              className="btn-primary btn-small"
                              onClick={() => saveEditPayment(payment.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-small"
                              onClick={cancelEditPayment}
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <div className="actions-dropdown-wrapper">
                            <button
                              type="button"
                              className="actions-menu-trigger"
                              onClick={(event) => toggleActionsMenu(event, payment)}
                              disabled={deletingPaymentId === payment.id || disableRowActions}
                              aria-haspopup="menu"
                              aria-expanded={isActionsExpanded}
                              aria-label="Open row actions"
                              id={`payment-actions-trigger-${payment.id}`}
                            >
                              ⋯
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    {searchQuery ? 'No payments match your search.' : 'No payments logged yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmDeletePaymentId)}
        title="Delete payment"
        message="This payment record will be permanently removed."
        confirmLabel="Delete payment"
        danger
        onConfirm={confirmDeletePayment}
        onCancel={cancelDelete}
      />

      <InvoicePreviewModal
        isOpen={Boolean(selectedInvoiceDeal)}
        deal={selectedInvoiceDeal}
        payments={invoicePayments}
        currencyFormatter={currencyFormatter}
        onClose={closeInvoice}
      />

      {actionsMenu && createPortal(
        <div
          className="actions-dropdown-menu actions-dropdown-menu-floating"
          role="menu"
          style={{ top: `${actionsMenu.top}px`, left: `${actionsMenu.left}px` }}
          onKeyDown={handleActionsMenuKeyDown}
        >
          <button
            type="button"
            className="actions-dropdown-item"
            onClick={() => {
              openInvoice(actionsMenu.orderId);
              closeActionsMenu(true);
            }}
            role="menuitem"
            ref={(element) => {
              menuItemRefs.current[0] = element;
            }}
          >
            Invoice
          </button>
          <button
            type="button"
            className="actions-dropdown-item"
            onClick={() => {
              if (menuPayment) {
                startEditPayment(menuPayment);
              }
            }}
            role="menuitem"
            disabled={!menuPayment}
            ref={(element) => {
              menuItemRefs.current[1] = element;
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="actions-dropdown-item actions-dropdown-item-danger"
            onClick={() => {
              handleDeletePayment(actionsMenu.paymentId);
              closeActionsMenu(true);
            }}
            role="menuitem"
            disabled={deletingPaymentId === actionsMenu.paymentId}
            ref={(element) => {
              menuItemRefs.current[2] = element;
            }}
          >
            {deletingPaymentId === actionsMenu.paymentId ? 'Deleting...' : 'Delete'}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

export default PaymentTracker;
