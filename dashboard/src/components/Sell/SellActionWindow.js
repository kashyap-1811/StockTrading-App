// SellActionWindow.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import GeneralContext from "../../contexts/GeneralContext";
import { useStockContext } from "../../contexts/StockContext";
import "./SellActionWindow.css";

const SellActionWindow = ({ uid, companyName, userHoldings = 0 }) => {
  // ✅ FIXED: Use useContext hook properly
  const { closeSellWindow } = useContext(GeneralContext);
  const { getCompanyData } = useStockContext();
  
  const [quantity, setQuantity] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(true);
  const [message, setMessage] = useState("");
  const [walletPoints, setWalletPoints] = useState(0);

  // Fetch current stock price and user data on component mount
  useEffect(() => {
    fetchCurrentPrice();
    loadUserData();
  }, [uid]);

  const fetchCurrentPrice = async () => {
    try {
      setFetchingPrice(true);
      
      // First try to get price from StockContext for consistency
      const companyData = getCompanyData(uid);
      if (companyData && companyData.price) {
        setCurrentPrice(companyData.price);
        setFetchingPrice(false);
        return;
      }
      
      // Fallback: Fetch current price from API if not in context
      const response = await axios.get(`http://localhost:8000/stocks/price/${uid}`);
      if (response.data.success) {
        setCurrentPrice(response.data.data.price);
      } else {
        // Final fallback: search for the stock to get current price
        const searchResponse = await axios.get(`http://localhost:8000/stocks/search?q=${uid}`);
        if (searchResponse.data.success && searchResponse.data.data.length > 0) {
          setCurrentPrice(searchResponse.data.data[0].price);
        }
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
      setMessage("Unable to fetch current price. Please try again.");
    } finally {
      setFetchingPrice(false);
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletPoints(response.data?.points || 0);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(userHoldings, parseInt(e.target.value) || 1));
    setQuantity(value);
    setMessage(""); // Clear any previous messages
  };

  const handleSellClick = async () => {
    if (!quantity || quantity <= 0) {
      setMessage("Enter valid quantity");
      return;
    }

    if (quantity > userHoldings) {
      setMessage(`You only own ${userHoldings} shares`);
      return;
    }

    if (currentPrice <= 0) {
      setMessage("Invalid stock price. Please try again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/sell",
        {
          symbol: uid,
          qty: Number(quantity),
          price: Number(currentPrice), // ✅ Uses current market price (not user input)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const totalValue = quantity * currentPrice;
      setMessage(`Successfully sold ${quantity} ${uid} @ ₹${formatPrice(currentPrice)}`);
      
      // ✅ FIXED: Use context function properly
      setTimeout(() => {
        closeSellWindow();
      }, 2000);

    } catch (error) {
      console.error("Sell failed", error);
      setMessage(error?.response?.data?.error || "Sale failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use context function properly
  const handleCancelClick = () => {
    closeSellWindow();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const totalSaleValue = quantity * currentPrice;
  const canSell = quantity > 0 && quantity <= userHoldings && currentPrice > 0;

  if (fetchingPrice) {
    return (
      <div className="container" id="sell-window">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching current price...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" id="sell-window">
      <div className="modal-header">
        <h3 className="sell-title">Sell {companyName || uid}</h3>
        <button className="close-btn" onClick={handleCancelClick}>✕</button>
      </div>

      <div className="stock-info-section">
        <div className="current-price-display">
          <span className="price-label">Current Price:</span>
          <span className="price-value">₹{formatPrice(currentPrice)}</span>
        </div>
        <div className="holdings-info">
          <span className="holdings-label">You Own:</span>
          <span className="holdings-value">{userHoldings} shares</span>
        </div>
      </div>

      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Quantity to Sell</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              max={userHoldings}
              onChange={handleQuantityChange}
              value={quantity}
              placeholder="Enter quantity"
            />
            <small className="input-help">Max: {userHoldings} shares</small>
          </fieldset>
        </div>

        <div className="sale-summary">
          <div className="summary-row">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </div>
          <div className="summary-row">
            <span>Price per share:</span>
            <span>₹{formatPrice(currentPrice)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Sale Value:</span>
            <span>₹{formatPrice(totalSaleValue)}</span>
          </div>
          <div className="summary-row">
            <span>After Sale Balance:</span>
            <span>₹{formatPrice(walletPoints + totalSaleValue)}</span>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="buttons">
        <div>
          <button 
            className={`btn ${canSell ? 'btn-red' : 'btn-disabled'}`}
            onClick={handleSellClick}
            disabled={loading || !canSell}
          >
            {loading ? 'Processing...' : `Sell ${quantity} Share${quantity > 1 ? 's' : ''}`}
          </button>
          <button 
            className="btn btn-grey" 
            onClick={handleCancelClick}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;
