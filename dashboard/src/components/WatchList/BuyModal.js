import React, { useState } from 'react';
import axios from 'axios';
import { useStockContext } from '../../contexts/StockContext';
import './BuyModal.css';

const BuyModal = ({ stock, uid, companyName, walletPoints, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { getCompanyData } = useStockContext();

  // Get real-time current price from StockContext
  const companyData = getCompanyData(uid);
  const currentPrice = companyData ? companyData.price : stock.price;
  const totalCost = (quantity || 0) * currentPrice;
  const canAfford = walletPoints >= totalCost && quantity > 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string for typing, but convert to number for validation
    if (value === '') {
      setQuantity('');
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setQuantity(numValue);
      }
    }
    setMessage("");
  };

  const placeBuyOrder = async () => {
    if (!quantity || quantity <= 0) {
      setMessage("Please enter a valid quantity");
      return;
    }
    
    if (!canAfford) {
      setMessage("Insufficient points");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/buy",
        { 
          symbol: uid, 
          name: companyName || uid, 
          qty: Number(quantity), 
          price: Number(currentPrice) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Successfully bought ${quantity} ${uid} @ ₹${formatPrice(currentPrice)}`);
      
      setTimeout(() => {
        onSuccess(totalCost);
        window.dispatchEvent(new CustomEvent('holdingsUpdated'));
      }, 2000);

    } catch (error) {
      setMessage(error?.response?.data?.error || "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="buy-modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="buy-title">Buy {companyName || uid}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Stock Info Section */}
        <div className="stock-info-section">
          <div className="info-row">
            <span className="info-label">Current Price:</span>
            <span className="info-value price">
              ₹{formatPrice(currentPrice)}
              <span className="live-indicator" title="Live price updates">🔴</span>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Available Balance:</span>
            <span className="info-value">₹{formatPrice(walletPoints)}</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Quantity to Buy</label>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={handleQuantityChange}
              className="form-input"
              placeholder="Enter quantity"
              step="1"
            />
          </div>

          {/* Purchase Summary */}
          <div className="purchase-summary">
            <div className="summary-row">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="summary-row">
              <span>Price per share:</span>
              <span>₹{formatPrice(currentPrice)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Cost:</span>
              <span>₹{formatPrice(totalCost)}</span>
            </div>
            <div className="summary-row">
              <span>After Purchase Balance:</span>
              <span>₹{(walletPoints - totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {!canAfford && (
              <div className="insufficient-funds">
                Insufficient funds (Need ₹{formatPrice(totalCost - walletPoints)} more)
              </div>
            )}
          </div>

          {/* Messages */}
          {message && (
            <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={placeBuyOrder} 
            disabled={loading || !canAfford || !quantity || quantity <= 0}
          >
            {loading ? 'Processing...' : `Buy ${quantity} Share${quantity > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
