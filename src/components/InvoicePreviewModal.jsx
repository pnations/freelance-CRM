import React, { useEffect } from 'react';

function InvoicePreviewModal({
  isOpen,
  deal,
  payments,
  currencyFormatter,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.classList.add('invoice-print-open');

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('invoice-print-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !deal) {
    return null;
  }

  const paidTotal = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const total = Number(deal.cost || 0);
  const balance = total - paidTotal;

  const now = new Date();
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + 14);

  const dealIdPart = String(deal.id || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-6)
    .toUpperCase() || 'XXXXXX';
  const invoiceNumber = `INV-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${dealIdPart}`;

  return (
    <div className="invoice-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="invoice-modal-title" onClick={onClose}>
      <div className="invoice-modal invoice-print-area" onClick={(event) => event.stopPropagation()}>
        <div className="invoice-modal-toolbar no-print">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
        </div>

        <div className="invoice-sheet">
          <div className="invoice-header">
            <h3 id="invoice-modal-title">Invoice</h3>
            <div className="invoice-meta">
              <div><strong>{invoiceNumber}</strong></div>
              <div>Issued: {now.toLocaleDateString()}</div>
              <div>Due: {dueDate.toLocaleDateString()}</div>
            </div>
          </div>

          <div className="invoice-grid">
            <div className="invoice-card">
              <h4>Bill To</h4>
              <p><strong>{deal.clientName || 'Client'}</strong></p>
              <p>{deal.clientContactPerson || ''}</p>
              <p>{deal.clientEmail || ''}</p>
              <p>{deal.clientPhone || ''}</p>
            </div>
            <div className="invoice-card">
              <h4>Deal Details</h4>
              <p><strong>Project Type:</strong> {deal.type || ''}</p>
              <p><strong>Date Accepted:</strong> {deal.dateAccepted || ''}</p>
              <p><strong>Status:</strong> {deal.status || ''}</p>
              <p><strong>Client Notes:</strong> {deal.clientNotes || 'None'}</p>
            </div>
          </div>

          <h4 className="invoice-section-title">Payment History</h4>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.date || ''}</td>
                    <td>{payment.method || '-'}</td>
                    <td style={{ textAlign: 'right' }}>{currencyFormatter.format(Number(payment.amount || 0))}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="empty-state">No payments recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-totals">
            <div className="invoice-total-row">
              <span>Total</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
            <div className="invoice-total-row">
              <span>Paid</span>
              <span>{currencyFormatter.format(paidTotal)}</span>
            </div>
            <div className="invoice-total-row balance">
              <span>Balance Due</span>
              <span>{currencyFormatter.format(balance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreviewModal;