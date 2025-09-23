import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Funds = () => {
  const [points, setPoints] = useState(0);
  const [totalAdded, setTotalAdded] = useState(0);
  const [history, setHistory] = useState([]);
  const [amount, setAmount] = useState(1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("ADD"); // ADD | WITHDRAW
  const [modalAmount, setModalAmount] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/funds", { headers: { Authorization: `Bearer ${token}` } });
        setPoints(res.data?.points || 0);
        setTotalAdded(res.data?.totalPointsAdded || 0);
        setHistory(res.data?.history || []);
      } catch (e) {}
    };
    load();
  }, []);

  const addFunds = async (val) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/wallet/add",
        { amount: Number(val) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPoints(res.data.points);
      const fres = await axios.get("http://localhost:8000/funds", { headers: { Authorization: `Bearer ${token}` } });
      setTotalAdded(fres.data?.totalPointsAdded || 0);
      setHistory(fres.data?.history || []);
    } catch (e) {
      console.error('Add funds error:', e);
      throw e; // Re-throw to be handled by the calling function
    }
  };

  const withdrawFunds = async (val) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/wallet/withdraw",
        { amount: Number(val) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPoints(res.data.points);
      const fres = await axios.get("http://localhost:8000/funds", { headers: { Authorization: `Bearer ${token}` } });
      setTotalAdded(fres.data?.totalPointsAdded || 0);
      setHistory(fres.data?.history || []);
    } catch (e) {
      console.error('Withdraw error:', e);
      throw e; // Re-throw to be handled by the calling function
    }
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setModalAmount("");
    setModalError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalLoading(false);
    setModalAmount("");
    setModalError("");
  };

  const confirmModal = async () => {
    setModalError("");
    const val = Number(modalAmount);
    if (!val || val <= 0) {
      setModalError("Enter a valid amount");
      return;
    }
    
    // Additional validation for withdraw
    if (modalMode === "WITHDRAW" && val > points) {
      setModalError("Insufficient points");
      return;
    }
    
    setModalLoading(true);
    try {
      if (modalMode === "ADD") {
        await addFunds(val);
      } else {
        await withdrawFunds(val);
      }
      closeModal();
    } catch (e) {
      const msg = e?.response?.data?.error || "Request failed";
      setModalError(msg);
      setModalLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/funds/export-csv", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important for file download
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'funds.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <>
      <div className="funds" style={{ justifyContent: "space-between", marginBottom: '20px' }}>
        <div>
          {/* <p>Wallet points for investing</p> */}
          <div style={{ marginTop: '8px', fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
            Current wallet points: {points.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <Link className="btn btn-green" onClick={() => openModal("ADD")} style={{ background: '#4caf50' }}>Add funds</Link>
          <Link className="btn btn-blue" onClick={() => openModal("WITHDRAW")} style={{ marginLeft: 8 }}>Withdraw</Link>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
          <h4>History (recent 15 transactions)</h4>
          <button 
            onClick={exportCSV} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Export CSV
          </button>
            </div>
        <div className="order-table" style={{ maxHeight: 480, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Time</th>
                <th>Type</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Amount</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 15).map((h, idx) => (
                <tr key={idx}>
                  <td className="align-left">{new Date(h.createdAt).toLocaleString()}</td>
                  <td>{h.type}</td>
                  <td>{h.symbol || '-'}</td>
                  <td>{h.qty || '-'}</td>
                  <td>{h.price || '-'}</td>
                  <td>{h.amount}</td>
                  <td>
                    {h.type === 'SELL' && h.profitLoss !== undefined ? (
                      <span style={{ 
                        color: h.profitLoss >= 0 ? '#10b981' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        {h.profitLoss >= 0 ? '+' : ''}₹{h.profitLoss.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', width: 360 }}>
            <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>{modalMode === 'ADD' ? 'Add funds' : 'Withdraw funds'}</strong>
              <button onClick={closeModal} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Amount</label>
              <input type="number" min={1} value={modalAmount} onChange={(e) => setModalAmount(e.target.value)} style={{ width: '90%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, boxSizing: 'border-box', marginRight: '10%' }} />
              {modalError && <div style={{ color: '#ef4444', marginTop: 8 }}>{modalError}</div>}
            </div>
            <div style={{ padding: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={closeModal} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmModal} disabled={modalLoading} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: modalMode === 'ADD' ? '#4caf50' : '#2563eb', color: '#fff', cursor: 'pointer' }}>{modalLoading ? 'Processing...' : (modalMode === 'ADD' ? 'Add' : 'Withdraw')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Funds;
