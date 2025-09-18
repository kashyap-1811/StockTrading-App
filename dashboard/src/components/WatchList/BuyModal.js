import React, { useState } from 'react';
import axios from 'axios';

const BuyModal = ({ stock, uid, companyName, walletPoints, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Use current stock price (not editable)
  const currentPrice = stock.price;
  const totalCost = quantity * currentPrice;
  const canAfford = walletPoints >= totalCost;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const handleQuantityChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setQuantity(value);
    setMessage(""); // Clear any previous messages
  };

  const placeBuyOrder = async () => {
    if (!quantity || quantity <= 0) {
      setMessage("Enter valid quantity");
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
      
      // Wait 2 seconds then close and update wallet
      setTimeout(() => {
        onSuccess(totalCost);
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
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Buy {companyName || uid}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="stock-info-card">
            <div className="current-price">
              <span className="label">Current Price:</span>
              <span className="price">₹{formatPrice(currentPrice)}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={handleQuantityChange}
              className="form-input"
              placeholder="Enter quantity"
            />
          </div>

          <div className="cost-summary">
            <div className="cost-row">
              <span>Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="cost-row">
              <span>Price per share:</span>
              <span>₹{formatPrice(currentPrice)}</span>
            </div>
            <div className="cost-row total">
              <span>Total Cost:</span>
              <span>₹{formatPrice(totalCost)}</span>
            </div>
            <div className="cost-row">
              <span>Available Balance:</span>
              <span>₹{formatPrice(walletPoints)}</span>
            </div>
            {!canAfford && (
              <div className="insufficient-funds">
                Insufficient funds (Need ₹{formatPrice(totalCost - walletPoints)} more)
              </div>
            )}
          </div>

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
            disabled={loading || !canAfford || quantity <= 0}
          >
            {loading ? 'Processing...' : `Buy ${quantity} Share${quantity > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
