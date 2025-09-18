import React from 'react';

const LoadingSpinner = ({ loading, searching }) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading top companies...</p>
      </div>
    );
  }

  if (searching) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Searching...</p>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
