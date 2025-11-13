import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Menu from "./Menu";

const TopBar = () => {
  const [niftyData, setNiftyData] = useState(null);
  const [sensexData, setSensexData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const fetchIndexData = useCallback(async () => {
    try {
      // Fetch Nifty 50 data using Yahoo Finance API (^NSEI)
      try {
        const niftySymbol = encodeURIComponent("^NSEI");
        const niftyResponse = await axios.get(`http://localhost:8000/stocks/index/${niftySymbol}`);
        if (niftyResponse.data.success && niftyResponse.data.data && niftyResponse.data.data.price) {
          setNiftyData(niftyResponse.data.data);
        }
      } catch (niftyError) {
        console.error("Error fetching Nifty data:", niftyError);
        // Try alternative symbol without ^
        try {
          const altResponse = await axios.get("http://localhost:8000/stocks/index/NSEI");
          if (altResponse.data.success && altResponse.data.data && altResponse.data.data.price) {
            setNiftyData(altResponse.data.data);
          }
        } catch (altError) {
          console.error("Error fetching Nifty with alternative symbol:", altError);
        }
      }

      // Fetch Sensex data using Yahoo Finance API (^BSESN)
      try {
        const sensexSymbol = encodeURIComponent("^BSESN");
        const sensexResponse = await axios.get(`http://localhost:8000/stocks/index/${sensexSymbol}`);
        if (sensexResponse.data.success && sensexResponse.data.data && sensexResponse.data.data.price) {
          setSensexData(sensexResponse.data.data);
        }
      } catch (sensexError) {
        console.error("Error fetching Sensex data:", sensexError);
        // Try alternative symbol without ^
        try {
          const altResponse = await axios.get("http://localhost:8000/stocks/index/BSESN");
          if (altResponse.data.success && altResponse.data.data && altResponse.data.data.price) {
            setSensexData(altResponse.data.data);
          }
        } catch (altError) {
          console.error("Error fetching Sensex with alternative symbol:", altError);
        }
      }
    } catch (error) {
      console.error("Error fetching index data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndexData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchIndexData, 30000);
    return () => clearInterval(interval);
  }, [fetchIndexData]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedIndex && !event.target.closest('.indices-container')) {
        setSelectedIndex(null);
      }
    };

    if (selectedIndex) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [selectedIndex]);

  const formatNumber = (num) => {
    if (!num) return "---";
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatPercent = (percent) => {
    if (!percent && percent !== 0) return "---";
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getColor = (percent) => {
    if (!percent && percent !== 0) return "rgb(146, 146, 146)";
    return percent >= 0 ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)";
  };

  const handleIndexClick = (indexName) => {
    if (selectedIndex === indexName) {
      setSelectedIndex(null);
    } else {
      setSelectedIndex(indexName);
    }
  };

  const selectedData = selectedIndex === 'nifty' ? niftyData : selectedIndex === 'sensex' ? sensexData : null;
  const selectedName = selectedIndex === 'nifty' ? 'NIFTY 50' : selectedIndex === 'sensex' ? 'SENSEX' : '';

  return (
    <div className="topbar-container">
      <Menu />
      
      <div className="indices-container">
        <div 
          className={`nifty ${selectedIndex === 'nifty' ? 'selected' : ''}`}
          onClick={() => handleIndexClick('nifty')}
        >
          <p className="index">NIFTY 50</p>
          {!loading && niftyData && niftyData.price && (
            <>
              <p className="index-points" style={{ color: getColor(niftyData.changePercent) }}>
                {formatNumber(niftyData.price)}
              </p>
              {(niftyData.changePercent !== undefined && niftyData.changePercent !== null) && (
                <p className="percent" style={{ color: getColor(niftyData.changePercent) }}>
                  {formatPercent(niftyData.changePercent)}
                </p>
              )}
            </>
          )}
          {loading && <p className="index-points">Loading...</p>}
        </div>
        
        <div 
          className={`sensex ${selectedIndex === 'sensex' ? 'selected' : ''}`}
          onClick={() => handleIndexClick('sensex')}
        >
          <p className="index">SENSEX</p>
          {!loading && sensexData && sensexData.price && (
            <>
              <p className="index-points" style={{ color: getColor(sensexData.changePercent) }}>
                {formatNumber(sensexData.price)}
              </p>
              {(sensexData.changePercent !== undefined && sensexData.changePercent !== null) && (
                <p className="percent" style={{ color: getColor(sensexData.changePercent) }}>
                  {formatPercent(sensexData.changePercent)}
                </p>
              )}
            </>
          )}
          {loading && <p className="index-points">Loading...</p>}
        </div>

        {selectedIndex && selectedData && (
          <div className="index-detail-popup">
            <div className="index-detail-content">
              <h3>{selectedName}</h3>
              <div className="detail-row">
                <span className="detail-label">Current Price:</span>
                <span className="detail-value" style={{ color: getColor(selectedData.changePercent) }}>
                  ₹{formatNumber(selectedData.price)}
                </span>
              </div>
              {(selectedData.changePercent !== undefined && selectedData.changePercent !== null) && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Change:</span>
                    <span className="detail-value" style={{ color: getColor(selectedData.changePercent) }}>
                      {formatPercent(selectedData.changePercent)}
                    </span>
                  </div>
                  {(selectedData.change !== undefined && selectedData.change !== null) && (
                    <div className="detail-row">
                      <span className="detail-label">Points Change:</span>
                      <span className="detail-value" style={{ color: getColor(selectedData.changePercent) }}>
                        {selectedData.change >= 0 ? '+' : ''}{formatNumber(selectedData.change)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
