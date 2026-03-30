import { useState } from 'react';

function useConfirmDelete({ execute, onSuccess, onError }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function requestDelete(id) {
    if (deletingId) return;
    setConfirmDeleteId(id);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  async function confirmDelete() {
    if (!confirmDeleteId) return;

    const id = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);

    try {
      await execute(id);
      if (onSuccess) {
        await onSuccess(id);
      }
    } catch (error) {
      if (onError) {
        onError(error, id);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return {
    deletingId,
    confirmDeleteId,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}

export default useConfirmDelete;
