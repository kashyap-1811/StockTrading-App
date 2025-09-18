import React from 'react';

const EmptyState = ({ show, isSearchResults }) => {
  if (!show) return null;

  return (
    <div className="empty-state">
      <div className="empty-icon">📈</div>
      <p>
        {isSearchResults 
          ? 'No companies found. Try a different search term.'
          : 'No companies available.'
        }
      </p>
    </div>
  );
};

export default EmptyState;
