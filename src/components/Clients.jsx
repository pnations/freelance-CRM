import React, { useState, useEffect } from 'react';
import { getClients, addClient, updateClient, deleteClient, getOrders } from '../services/dataService';
import ConfirmDialog from './ConfirmDialog';
import '../styles/forms.css';
import '../styles/clients.css';

function Clients({ readOnly = false }) {
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (readOnly) {
      setClients([]);
      setOrders([]);
      setShowForm(false);
      setEditingId(null);
      setSelectedClient(null);
      return;
    }
    loadData();
  }, [readOnly]);

  async function loadData() {
    try {
      const clientsData = await getClients();
      const ordersData = await getOrders();
      setClients(clientsData);
      setOrders(ordersData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load clients.');
      setClients([]);
      setOrders([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (readOnly) return;

    if (formData.businessName && formData.contactPerson) {
      setIsSubmitting(true);
      setErrorMessage('');
      try {
        if (editingId) {
          await updateClient(
            editingId,
            formData.businessName,
            formData.contactPerson,
            formData.email,
            formData.phone,
            formData.notes
          );
          setEditingId(null);
        } else {
          await addClient(
            formData.businessName,
            formData.contactPerson,
            formData.email,
            formData.phone,
            formData.notes
          );
        }
        resetForm();
        await loadData();
      } catch (error) {
        setErrorMessage(error.message || 'Failed to save client.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function resetForm() {
    setFormData({
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      notes: '',
    });
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(client) {
    if (readOnly) return;
    setFormData({
      businessName: client.businessName,
      contactPerson: client.contactPerson,
      email: client.email || '',
      phone: client.phone || '',
      notes: client.notes || '',
    });
    setEditingId(client.id);
    setShowForm(true);
    setSelectedClient(null);
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
      await deleteClient(id);
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
      await loadData();
    } catch (error) {
      setErrorMessage(error.message || 'Failed to delete client.');
    } finally {
      setDeletingId(null);
    }
  }

  function viewClientDetails(client) {
    setSelectedClient(client);
    setShowForm(false);
  }

  function getClientProjects(clientName) {
    return orders.filter(order => order.clientName === clientName);
  }

  function getFilteredClients() {
    if (!searchQuery.trim()) {
      return clients;
    }
    
    const query = searchQuery.toLowerCase();
    return clients.filter(client => 
      client.businessName.toLowerCase().includes(query) ||
      client.contactPerson.toLowerCase().includes(query) ||
      (client.email && client.email.toLowerCase().includes(query)) ||
      (client.phone && client.phone.includes(query)) ||
      (client.notes && client.notes.toLowerCase().includes(query))
    );
  }

  return (
    <div className="clients-page order-form">
      <div className="header">
        <h2>Clients</h2>
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
            setSelectedClient(null);
          }}
        >
          {showForm ? 'Cancel' : 'Add Client'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        title="Delete client"
        message="This will permanently delete the client if there are no related orders."
        confirmLabel="Delete client"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {readOnly && <p className="readonly-note">Read-only mode: configure Supabase credentials to enable creating, editing, and deleting records.</p>}
      {errorMessage && <p className="error-banner">{errorMessage}</p>}

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showForm && (
        <form className="form" onSubmit={handleSubmit}>
              <h3>{editingId ? 'Edit Client' : 'New Client'}</h3>
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Person *</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

          <button type="submit" className="btn-primary" disabled={readOnly || isSubmitting}>
            {isSubmitting ? 'Saving...' : editingId ? 'Update Client' : 'Add Client'}
          </button>
        </form>
      )}

      <div className="table-wrapper">
        <table className="table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Projects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredClients().map((client) => {
                  const clientProjects = getClientProjects(client.businessName);
                  return (
                    <tr
                      key={client.id}
                      className={selectedClient?.id === client.id ? 'selected-row' : ''}
                      onClick={() => viewClientDetails(client)}
                    >
                      <td>{client.businessName}</td>
                      <td>{client.contactPerson}</td>
                      <td>{client.email || '—'}</td>
                      <td>{client.phone || '—'}</td>
                      <td>{clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary btn-small"
                          disabled={readOnly || deletingId === client.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger btn-small"
                          disabled={readOnly || deletingId === client.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client.id);
                          }}
                        >
                          {deletingId === client.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {getFilteredClients().length === 0 && (
            <p className="empty-state">
              {searchQuery ? 'No clients match your search.' : 'No clients yet. Add your first client to get started.'}
            </p>
          )}

      {selectedClient && (
          <div className="client-details-panel">
            <div className="client-details-header">
              <h3>{selectedClient.businessName}</h3>
              <button
                type="button"
                className="btn-secondary btn-small"
                disabled={readOnly}
                onClick={() => handleEdit(selectedClient)}
              >
                Edit Contact Details
              </button>
            </div>

            <div className="client-info-section">
              <h4>Contact Information</h4>
              <div className="info-grid">
                <div className="info-item">
                  <label>Contact Person</label>
                  <p>{selectedClient.contactPerson}</p>
                </div>
                {selectedClient.email && (
                  <div className="info-item">
                    <label>Email</label>
                    <p><a href={`mailto:${selectedClient.email}`}>{selectedClient.email}</a></p>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="info-item">
                    <label>Phone</label>
                    <p><a href={`tel:${selectedClient.phone}`}>{selectedClient.phone}</a></p>
                  </div>
                )}
                {selectedClient.notes && (
                  <div className="info-item full-width">
                    <label>Notes</label>
                    <p>{selectedClient.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="client-projects-section">
              <h4>Projects ({getClientProjects(selectedClient.businessName).length})</h4>
              <div className="projects-list">
                {getClientProjects(selectedClient.businessName).length > 0 ? (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Project Type</th>
                          <th>Date Accepted</th>
                          <th>Status</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getClientProjects(selectedClient.businessName).map((project) => (
                          <tr key={project.id}>
                            <td>{project.type}</td>
                            <td>{new Date(project.dateAccepted).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                                {project.status}
                              </span>
                            </td>
                            <td>${Number(project.cost).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="empty-state">No projects for this client yet.</p>
                )}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
