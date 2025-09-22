import React, { useState } from 'react';
import axios from 'axios';
import './SellModal.css';

const SellModal = ({ 
  isOpen, 
  onClose, 
  selectedHolding, 
  walletPoints,
  onSellSuccess 
}) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen || !selectedHolding) return null;

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Allow empty string for typing, but convert to number for validation
    if (value === '') {
      setQty('');
    } else {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= selectedHolding.qty) {
        setQty(numValue);
      }
    }
    setMessage("");
  };

  const placeSellOrder = async () => {
    if (!qty || qty <= 0) {
      setMessage("Please enter a valid quantity");
      return;
    }
    
    if (qty > selectedHolding.qty) {
      setMessage("Quantity cannot exceed available shares");
      return;
    }
    
    setLoading(true);
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      const currentPrice = selectedHolding.currentPrice || selectedHolding.price;
      const proceeds = qty * currentPrice;
      
      await axios.post(
        "http://localhost:8000/sell",
        { 
          symbol: selectedHolding.symbol, 
          qty: Number(qty), 
          price: Number(currentPrice)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessage(`Successfully sold ${qty} ${selectedHolding.name} @ ₹${currentPrice.toFixed(2)}`);
      
      setTimeout(() => {
        onSellSuccess(proceeds);
        window.dispatchEvent(new CustomEvent('holdingsUpdated'));
        onClose();
      }, 2000);
    } catch (e) {
      setMessage(e?.response?.data?.error || "Sale failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQty(1);
    setMessage("");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const currentPrice = selectedHolding.currentPrice || selectedHolding.price;
  const totalSaleValue = qty * currentPrice;
  const canSell = qty && qty > 0 && qty <= selectedHolding.qty;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="sell-modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="sell-title">Sell {selectedHolding.name}</h3>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* Stock Info Section */}
        <div className="stock-info-section">
          <div className="info-row">
            <span className="info-label">Current Price:</span>
            <span className="info-value price">₹{currentPrice.toFixed(2)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">You Own:</span>
            <span className="info-value">
              {selectedHolding.qty} shares
            </span>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Quantity to Sell</label>
            <input 
              type="number" 
              min="1" 
              max={selectedHolding.qty}
              value={qty} 
              onChange={handleQuantityChange}
              className="form-input"
              placeholder="Enter quantity"
            />
            <small className="input-help">Max: {selectedHolding.qty} shares</small>
          </div>

          {/* Sale Summary */}
          <div className="sale-summary">
            <div className="summary-row">
              <span>Quantity:</span>
              <span>{qty}</span>
            </div>
            <div className="summary-row">
              <span>Price per share:</span>
              <span>₹{currentPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Sale Value:</span>
              <span>₹{totalSaleValue.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>After Sale Balance:</span>
              <span>₹{(walletPoints + totalSaleValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div className={`message ${message.includes('Successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={placeSellOrder} 
            disabled={loading || !canSell}
          >
            {loading ? 'Processing...' : `Sell ${qty} Share${qty > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellModal;
