import React from 'react';

function TableActions({
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  isDeleting = false,
  readOnly = false,
  stopPropagation = false,
}) {
  function handleClick(handler) {
    return (event) => {
      if (stopPropagation) {
        event.stopPropagation();
      }
      handler();
    };
  }

  return (
    <>
      {onEdit && (
        <button
          type="button"
          className="btn-secondary btn-small"
          disabled={readOnly || !canEdit || isDeleting}
          onClick={handleClick(onEdit)}
        >
          Edit
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="btn-danger btn-small"
          disabled={readOnly || !canDelete || isDeleting}
          onClick={handleClick(onDelete)}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      )}
    </>
  );
}

export default TableActions;
