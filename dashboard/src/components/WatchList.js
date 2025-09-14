import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import GeneralContext from "./GeneralContext";
import axios from "axios";

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Tooltip from "@mui/material/Tooltip";
import Grow from "@mui/material/Grow";

import { watchlist } from "../data/data";
import './WatchList.css';

const WatchList = () => {
  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => {
          return <WatchListItem stock={stock} key={index} />;
        })}
      </ul>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [walletPoints, setWalletPoints] = useState(0);

  const handleBuyClick = () => {
    setIsModalOpen(true);
    setQty(1);
    setPrice(0);
    setMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLoading(false);
    setQty(1);
    setPrice(0);
    setMessage("");
  };

  const placeBuyOrder = async () => {
    if (!qty || !price || qty <= 0 || price <= 0) {
      setMessage("Enter valid quantity and price");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const cost = qty * price;
      if (walletPoints < cost) {
        setMessage("Insufficient points");
        setLoading(false);
        return;
      }
      await axios.post(
        "http://localhost:8000/buy",
        { symbol: uid, qty: Number(qty), price: Number(price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Bought ${qty} ${uid} @ ${price}`);
      setWalletPoints(prev => prev - cost);
      setTimeout(() => closeModal(), 2000);
    } catch (e) {
      setMessage(e?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  // Load wallet points
  React.useEffect(() => {
    const loadWallet = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWalletPoints(res.data?.points || 0);
      } catch (e) {
        // ignore
      }
    };
    loadWallet();
  }, []);

  return (
    <>
      <span className="actions">
        <span>
          <Tooltip
            title="Buy (B)"
            placement="top"
            arrow
            TransitionComponent={Grow}
            onClick={handleBuyClick}
          >
            <button className="buy">Buy</button>
          </Tooltip>
          
          <Tooltip
            title="Analytics (A)"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button className="action">
              <BarChartOutlined className="icon" />
            </button>
          </Tooltip>
          <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
            <button className="action">
              <MoreHoriz className="icon" />
            </button>
          </Tooltip>
        </span>
      </span>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', width: 400 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ color: '#16a34a' }}>Buy {uid}</strong>
              <button onClick={closeModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Quantity</label>
                <input 
                  type="number" 
                  min={1} 
                  value={qty} 
                  onChange={(e) => setQty(Number(e.target.value))} 
                  style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Price</label>
                <input 
                  type="number" 
                  step="0.05" 
                  min={0} 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))} 
                  style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, fontSize: '14px' }}>
                <div>Cost: ₹{(qty * price).toFixed(2)}</div>
                <div>Available: ₹{walletPoints.toLocaleString('en-IN')}</div>
                {qty * price > walletPoints && <div style={{ color: '#ef4444' }}>Insufficient points</div>}
              </div>
              {message && <div style={{ marginBottom: 16, color: message.toLowerCase().includes("fail") || message.toLowerCase().includes("insufficient") ? "#ef4444" : "#16a34a" }}>{message}</div>}
            </div>
            <div style={{ padding: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeModal} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={placeBuyOrder} 
                disabled={loading || qty * price > walletPoints} 
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: 8, 
                  border: 'none', 
                  background: loading || qty * price > walletPoints ? '#9ca3af' : '#16a34a', 
                  color: '#fff', 
                  cursor: loading || qty * price > walletPoints ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? 'Buying...' : 'Place Buy Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};