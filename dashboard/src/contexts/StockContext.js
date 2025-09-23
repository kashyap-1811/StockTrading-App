import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const StockContext = createContext();

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Function to get all companies
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/stocks/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
        setLastUpdated(new Date());
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to silently refresh companies (without loading state)
  const fetchCompaniesSilently = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8000/stocks/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
        setLastUpdated(new Date());
        console.log('Companies data refreshed silently');
      }
    } catch (error) {
      console.error('Error silently fetching companies:', error);
    }
  }, []);

  // Function to search companies
  const searchCompanies = useCallback(async (query) => {
    if (!query || query.length < 2) {
      return [];
    }
    
    try {
      const response = await axios.get(`http://localhost:8000/stocks/search?q=${encodeURIComponent(query)}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      return [];
    }
  }, []);

  // Function to get stock price for a specific symbol from companies array
  const fetchStockPrice = (symbol) => {
    // Use the companies array instead of making backend calls
    const companyData = getCompanyData(symbol);
    return companyData ? {
      symbol: companyData.symbol,
      price: companyData.price
    } : null;
  };

  // Function to get company data by symbol
  const getCompanyData = (symbol) => {
    // First try exact match
    let company = companies.find(company => company.symbol === symbol);
    
    // If not found, try with .NS suffix
    if (!company && !symbol.includes('.NS')) {
      company = companies.find(company => company.symbol === symbol + '.NS');
    }
    
    // If still not found, try without .NS suffix
    if (!company && symbol.includes('.NS')) {
      const cleanSymbol = symbol.replace('.NS', '');
      company = companies.find(company => company.symbol === cleanSymbol);
    }
    
    return company || null;
  };

  // Initial fetch of companies
  useEffect(() => {
    fetchCompanies();
  }, []); // Remove fetchCompanies dependency

  // Auto-refresh companies data every 60 seconds (silent refresh)
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent refresh without showing loading state
      fetchCompaniesSilently();
    }, 60000); // 60 seconds (reduced frequency)

    return () => clearInterval(interval);
  }, [fetchCompaniesSilently]);

  const value = {
    companies,
    loading,
    lastUpdated,
    searchCompanies,
    fetchStockPrice,
    getCompanyData
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};