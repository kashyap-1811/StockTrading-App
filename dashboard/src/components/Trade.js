import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const Panel = ({ children, title }) => (
  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", padding: 16 }}>
    {title && <h3 style={{ marginTop: 0, marginBottom: 12, fontWeight: 500 }}>{title}</h3>}
    {children}
  </div>
);

const Trade = () => {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "sell" ? "sell" : "buy";

  const [mode, setMode] = useState(initialMode);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [walletPoints, setWalletPoints] = useState(0);
  const [message, setMessage] = useState("");

  const isBuy = mode === "buy";
  const headerColor = isBuy ? "#16a34a" : "#2563eb"; // Buy is green, sell is blue
  const isModeLocked = searchParams.get("mode") !== null; // Lock mode if specified in URL
  const isFromSell = searchParams.get("mode") === "sell"; // Check if coming from sell

  const cost = Number(qty) * Number(price);
  const canSubmit = qty > 0 && price > 0 && !loading;

  useEffect(() => {
    const loadUser = async () => {
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
    loadUser();
  }, []);

  const placeOrder = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const endpoint = isBuy ? "/buy" : "/sell";
      await axios.post(
        `http://localhost:8000${endpoint}`,
        { symbol, qty: Number(qty), price: Number(price) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`${isBuy ? "Bought" : "Sold"} ${qty} ${symbol} @ ${price}`);
      // optimistic wallet update
      setWalletPoints(prev => (isBuy ? prev - cost : prev + cost));
      // Trigger holdings refresh
      window.dispatchEvent(new CustomEvent('holdingsUpdated'));
    } catch (e) {
      setMessage(e?.response?.data?.error || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>{symbol}</h2>
          <small style={{ color: "#6b7280" }}>Trade {symbol} - long term investing</small>
        </div>
        <button 
          onClick={() => isFromSell ? navigate('/holdings') : navigate(-1)} 
          className="btn btn-blue"
        >
          Back
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Panel title="Order">
          {!isModeLocked && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button
                className="btn"
                style={{ 
                  background: isBuy ? "#16a34a" : "#e5e7eb", 
                  color: isBuy ? "#fff" : "#111827",
                  border: isBuy ? "1px solid #16a34a" : "1px solid #e5e7eb"
                }}
                onClick={() => navigate(`/trade/${encodeURIComponent(symbol)}?mode=buy`)}
              >
                Buy
              </button>
              <button
                className="btn"
                style={{ 
                  background: !isBuy ? "#2563eb" : "#e5e7eb", 
                  color: !isBuy ? "#fff" : "#111827",
                  border: !isBuy ? "1px solid #2563eb" : "1px solid #e5e7eb"
                }}
                onClick={() => navigate(`/trade/${encodeURIComponent(symbol)}?mode=sell`)}
              >
                Sell
              </button>
            </div>
          )}
          
          {isModeLocked && (
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 8, 
              marginBottom: 12,
              padding: "8px 12px",
              backgroundColor: isBuy ? "#dcfce7" : "#dbeafe",
              borderRadius: "8px",
              border: `1px solid ${headerColor}`
            }}>
              <div style={{ 
                width: "8px", 
                height: "8px", 
                borderRadius: "50%", 
                backgroundColor: headerColor 
              }}></div>
              <span style={{ 
                fontWeight: "600", 
                color: headerColor,
                textTransform: "uppercase",
                fontSize: "14px"
              }}>
                {isBuy ? "Buy" : "Sell"} Mode
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", color: "#6b7280", fontSize: 12 }}>Quantity</label>
              <input 
                type="number" 
                min={1} 
                value={qty || ''} 
                onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))} 
                style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 8, width: 160 }} 
              />
            </div>
            <div>
              <label style={{ display: "block", color: "#6b7280", fontSize: 12 }}>Price</label>
              <input 
                type="number" 
                step="0.05" 
                min={0} 
                value={price || ''} 
                onChange={e => setPrice(Math.max(0, Number(e.target.value) || 0))} 
                style={{ padding: 8, border: "1px solid #e5e7eb", borderRadius: 8, width: 160 }} 
              />
            </div>
            <div>
              <button disabled={!canSubmit || (isBuy && cost > walletPoints)} onClick={placeOrder} className="btn btn-blue" style={{ background: headerColor }}>
                {loading ? (isBuy ? "Buying..." : "Selling...") : isBuy ? "Place Buy" : "Place Sell"}
              </button>
            </div>
          </div>

          {message && <div style={{ marginTop: 12, color: message.toLowerCase().includes("fail") || message.toLowerCase().includes("insufficient") ? "#ef4444" : "#16a34a" }}>{message}</div>}
          <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>
            {isBuy ? (
              <span>Cost: {isNaN(cost) ? 0 : cost} | Available: {walletPoints} {cost > walletPoints ? "(Insufficient points)" : ""}</span>
            ) : (
              <span>Proceeds: {isNaN(cost) ? 0 : cost} | Wallet after sell: {walletPoints + (isNaN(cost) ? 0 : cost)}</span>
            )}
          </div>
        </Panel>

        <Panel title="Details">
          <div style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.8 }}>
            <div>Wallet points adjust with each trade.</div>
            <div>Holdings update on Buy and Sell.</div>
            <div>This platform is for long-term investing only.</div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default Trade;


