import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

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
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    // Prevent multiple socket initializations
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected, skipping initialization');
      return socketRef.current;
    }

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io('http://localhost:8000', {
      transports: ['polling', 'websocket'],
      timeout: 30000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5,
      forceNew: false,
      autoConnect: true,
      upgrade: true,
      rememberUpgrade: true
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully:', socketRef.current.id);
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      // Only attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        console.log('Disconnect was intentional, not reconnecting');
        return;
      }
      
      // Add delay before attempting reconnection
      reconnectTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && !socketRef.current.connected) {
          console.log('Attempting to reconnect...');
          socketRef.current.connect();
        }
      }, 10000); // 10 second delay
    });

    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    socketRef.current.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    socketRef.current.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socketRef.current.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setIsConnected(false);
    });

    socketRef.current.on('stockPricesUpdate', (data) => {
      if (data && data.companies) {
        setCompanies(data.companies);
        setLastUpdated(new Date());
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    return socketRef.current;
  }, []);

  // Function to get all companies (fallback for initial load)
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
      setCompanies([]);
    } finally {
      setLoading(false);
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
      return [];
    }
  }, []);

  // Function to get stock price for a specific symbol from companies array
  const fetchStockPrice = (symbol) => {
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

  // Initialize socket and fetch initial data
  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket();
    
    // Fetch initial data
    fetchCompanies();

    // Set up fallback polling if socket fails
    const fallbackInterval = setInterval(() => {
      if (socketRef.current && !socketRef.current.connected) {
        console.log('Socket disconnected, fetching data via HTTP...');
        fetchCompanies();
      }
    }, 30000); // Fallback every 30 seconds if socket is down

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
      }
      clearInterval(fallbackInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeSocket, fetchCompanies]);

  const value = {
    companies,
    loading,
    lastUpdated,
    isConnected,
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