import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Holdings.css";

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [walletPoints, setWalletPoints] = useState(0);

  useEffect(() => {
    const fetchHoldings = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:8000/holdings", {
          headers: {
            Authorization: `Bearer ${token}`,  // 👈 attach JWT here
          },
        });
        setHoldings(response.data);
      } catch (error) {
        console.error("Error fetching holdings:", error);
      }
    };

    fetchHoldings();
  }, []);

  const totalInvestment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.price * h.qty, 0);
  const pnl = currentValue - totalInvestment;
  const pnlPercent = ((pnl / totalInvestment) * 100).toFixed(2);

  const handleSellClick = (holding) => {
    setSelectedHolding(holding);
    setQty(1);
    setPrice(holding.price);
    setMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setLoading(false);
    setSelectedHolding(null);
    setQty(1);
    setPrice(0);
    setMessage("");
  };

  const placeSellOrder = async () => {
    if (!qty || !price || qty <= 0 || price <= 0) {
      setMessage("Enter valid quantity and price");
      return;
    }
    if (qty > selectedHolding.qty) {
      setMessage("Insufficient holdings");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const proceeds = qty * price;
      await axios.post(
        "http://localhost:8000/sell",
        { symbol: selectedHolding.name, qty: Number(qty), price: Number(price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Sold ${qty} ${selectedHolding.name} @ ${price}`);
      setWalletPoints(prev => prev + proceeds);
      // Refresh holdings
      const response = await axios.get("http://localhost:8000/holdings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(response.data);
      setTimeout(() => closeModal(), 2000);
    } catch (e) {
      setMessage(e?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  // Load wallet points
  useEffect(() => {
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
      <h3 style={{ margin: '16px 0' }}>Holdings ({holdings.length})</h3>

      <div className="summary-row">
        <div className="summary-card">
          <h5>₹{totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h5>
          <p>Total Investment</p>
        </div>
        <div className="summary-card">
          <h5>₹{currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h5>
          <p>Current Value</p>
        </div>
        <div className="summary-card">
          <h5 className={pnl >= 0 ? "profit" : "loss"}>
            ₹{pnl.toFixed(2)} ({pnl >= 0 ? "+" : ""}
            {pnlPercent}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. Cost</th>
              <th>LTP</th>
              <th>Cur. Value</th>
              <th>P&L</th>
              <th>Net Chg.</th>
              <th>Day Chg.</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((item, index) => {
              const currentVal = (item.price * item.qty).toFixed(2);
              const gain = item.price * item.qty - item.avg * item.qty;
              const gainFormatted = gain.toFixed(2);
              const isNetPositive = parseFloat(item.net) >= 0;
              const isDayPositive = parseFloat(item.day) >= 0;

              return (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.avg.toFixed(2)}</td>
                  <td>{item.price.toFixed(2)}</td>
                  <td>{currentVal}</td>
                  <td className={gain >= 0 ? "profit" : "loss"}>{gainFormatted}</td>
                  <td className={isNetPositive ? "profit" : "loss"}>{item.net}</td>
                  <td className={isDayPositive ? "profit" : "loss"}>{item.day}</td>
                  <td>
                    <button 
                      onClick={() => handleSellClick(item)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedHolding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', width: 400 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ color: '#2563eb' }}>Sell {selectedHolding.name}</strong>
              <button onClick={closeModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Quantity (Max: {selectedHolding.qty})</label>
                <input 
                  type="number" 
                  min={1} 
                  max={selectedHolding.qty}
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
                <div>Proceeds: ₹{(qty * price).toFixed(2)}</div>
                <div>Available to sell: {selectedHolding.qty} shares</div>
                <div>Current wallet: ₹{walletPoints.toLocaleString('en-IN')}</div>
                {qty > selectedHolding.qty && <div style={{ color: '#ef4444' }}>Cannot sell more than available</div>}
              </div>
              {message && <div style={{ marginBottom: 16, color: message.toLowerCase().includes("fail") || message.toLowerCase().includes("insufficient") ? "#ef4444" : "#16a34a" }}>{message}</div>}
            </div>
            <div style={{ padding: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeModal} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={placeSellOrder} 
                disabled={loading || qty > selectedHolding.qty} 
                style={{ 
                  padding: '10px 14px', 
                  borderRadius: 8, 
                  border: 'none', 
                  background: loading || qty > selectedHolding.qty ? '#9ca3af' : '#2563eb', 
                  color: '#fff', 
                  cursor: loading || qty > selectedHolding.qty ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? 'Selling...' : 'Place Sell Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Holdings;
