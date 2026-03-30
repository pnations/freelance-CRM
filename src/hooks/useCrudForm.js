import { useState } from 'react';

function useCrudForm(getInitialFormData) {
  const [formData, setFormData] = useState(() => getInitialFormData());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function resetForm() {
    setFormData(getInitialFormData());
    setShowForm(false);
    setEditingId(null);
  }

  return {
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
  };
}

export default useCrudForm;
