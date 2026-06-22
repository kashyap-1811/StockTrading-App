import React, { useState, useEffect } from "react";
import { useStockContext } from "../../contexts/StockContext";
import SearchBar from "./searchBar";
import WatchListItem from "./WatchListItem";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import './WatchList.css';

const WatchList = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { companies, loading, searchCompanies } = useStockContext();

  // Search functionality with debouncing
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }

    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await searchCompanies(searchQuery);
          setSearchResults(results);
        } catch (error) {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCompanies]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Determine what data to display
  const displayData = searchQuery.length >= 2 ? searchResults : companies;
  const isShowingSearchResults = searchQuery.length >= 2;

  return (
    <div className="watchlist-container">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        resultCount={isShowingSearchResults ? searchResults.length : companies.length}
        isShowingSearchResults={isShowingSearchResults}
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
                key={`${stock.symbol}-${index}`} 
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default WatchList;
