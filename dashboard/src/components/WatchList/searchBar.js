// components/SearchBar.js - Update to show page info
import React from 'react';

const SearchBar = ({ searchQuery, onSearchChange, resultCount, isShowingSearchResults, currentPage, totalPages }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search eg: Apple/AAPL"
        className="search"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
