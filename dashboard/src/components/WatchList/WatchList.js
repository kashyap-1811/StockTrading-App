// WatchList.js - Update pagination logic

import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "./searchBar";
import WatchListItem from "./WatchListItem";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import './WatchList.css';

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 5; // 100 companies / 20 per page = 5 pages

  // Load top companies when page changes
  useEffect(() => {
    fetchTopCompanies();
  }, [currentPage]);

  // Search functionality with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchCompanies();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchTopCompanies = async () => {
    try {
      setLoading(true);
      console.log(`Fetching page ${currentPage}`); // Debug log
      
      const response = await axios.get(`http://localhost:8000/stocks/top-companies?page=${currentPage}`);
      if (response.data.success) {
        console.log(`Received ${response.data.data.length} companies for page ${currentPage + 1}`); // Debug log
        setWatchlist(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching top companies:', error);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCompanies = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`http://localhost:8000/stocks/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.data.success) {
        setSearchResults(response.data.data);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Updated pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGoToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Determine what data to display
  const displayData = searchQuery.length >= 2 ? searchResults : watchlist;
  const isShowingSearchResults = searchQuery.length >= 2;

  return (
    <div className="watchlist-container">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        resultCount={isShowingSearchResults ? searchResults.length : watchlist.length}
        isShowingSearchResults={isShowingSearchResults}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <LoadingSpinner 
        loading={loading && !isShowingSearchResults} 
        searching={isSearching}
      />

      <EmptyState
        show={!loading && !isSearching && displayData.length === 0}
        isSearchResults={isShowingSearchResults}
      />

      {displayData.length > 0 && (
        <>
          <ul className="list">
            {displayData.map((stock, index) => (
              <WatchListItem 
                stock={stock} 
                key={`${stock.symbol}-${index}-page-${currentPage}`} 
              />
            ))}
          </ul>

          {!isShowingSearchResults && (
            <div className="pagination-container">
              <button 
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleGoToPage(index)}
                    className={`page-number ${currentPage === index ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WatchList;
