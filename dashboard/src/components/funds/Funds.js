import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Funds.css";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [razorpayKey, setRazorpayKey] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8000/funds", { headers: { Authorization: `Bearer ${token}` } });
        setPoints(res.data?.points || 0);
        setTotalAdded(res.data?.totalPointsAdded || 0);
        setHistory(res.data?.history || []);
      } catch (e) { }
    };

    const loadRazorpayKey = async () => {
      try {
        const res = await axios.get("http://localhost:8000/razorpay-key");
        if (res.data.success) {
          setRazorpayKey(res.data.key);
        }
      } catch (e) {
        console.error("Failed to load Razorpay key:", e);
      }
    };

    load();
    loadRazorpayKey();
  }, []);

  const addFunds = async (val) => {
    try {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          setModalError("Failed to load payment gateway. Please try again.");
          return;
        }
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:8000/wallet/add/create-order",
        { amount: Number(val) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.success) {
        console.error("Order creation failed:", res.data);
        setModalError(res.data.message || "Failed to create order!");
        return;
      }

      const { order } = res.data;
      
      if (!razorpayKey) {
        setModalError("Payment gateway not ready. Please try again.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Stock Trading Platform",
        description: `Add funds to wallet - ₹${val}`,
        order_id: order.id,
        image: "https://example.com/your_logo", // Add your logo URL here
        handler: async function (response) {
          try {
            // Step 3: Verify payment + Save booking
            const verifyRes = await axios.post("http://localhost:8000/wallet/add/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount,
            },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              alert("Funds added successfully!");
              // Refresh funds data
              const fres = await axios.get("http://localhost:8000/funds", { headers: { Authorization: `Bearer ${token}` } });
              setPoints(fres.data?.points || 0);
              setTotalAdded(fres.data?.totalPointsAdded || 0);
              setHistory(fres.data?.history || []);
              closeModal();
            } else {
              console.error("Payment verification failed:", verifyRes.data);
              setModalError(verifyRes.data.message || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            setModalError("Error verifying payment.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: { color: "#4F46E5" },
        modal: {
          ondismiss: function () {
            setModalLoading(false);
            console.log('Payment form closed');
          }
        }
      };

      // Create a new instance each time
      const rzp = new window.Razorpay(options);

      // Handle payment failures
      rzp.on('payment.failed', function (response) {
        setModalError(`Payment failed: ${response.error.description}`);
        setModalLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Add funds error:', err);
      setModalError("Failed to create payment order. Please try again.");
      throw err; // Re-throw to be handled by the calling function
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
        closeModal();
      }
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

  // Calculate summary statistics
  const totalWithdrawn = history
    .filter(h => h.type === 'WITHDRAW')
    .reduce((sum, h) => sum + Math.abs(h.amount), 0);

  const recentTransactions = history.slice(0, 15);
  const hasRecentActivity = recentTransactions.length > 0;

return (
  <>
    <div className="funds-header">
      <h3>Funds Management</h3>
    </div>

    <SummaryCards
      currentBalance={points}
      totalAdded={totalAdded}
      totalWithdrawn={totalWithdrawn}
      isLoading={false}
    />

    <div className="funds-actions">
      <button
        className="btn btn-primary"
        onClick={() => openModal("ADD")}
      >
        Add Funds
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => openModal("WITHDRAW")}
      >
        Withdraw
      </button>
      <button
        className="btn btn-outline"
        onClick={exportCSV}
      >
        Export CSV
      </button>
    </div>

    <FundsTable
      history={recentTransactions}
      isLoading={false}
    />

    <FundsModal
      isOpen={isModalOpen}
      mode={modalMode}
      amount={modalAmount}
      error={modalError}
      loading={modalLoading}
      onClose={closeModal}
      onAmountChange={setModalAmount}
      onConfirm={confirmModal}
    />
  </>
  );
};

// Summary Cards Component
const SummaryCards = ({ currentBalance, totalAdded, totalWithdrawn, isLoading }) => (
  <div className="summary-row">
    <div className="summary-card">
      <h5>
        {isLoading ? (
          <span className="loading-text">Loading...</span>
        ) : (
          `₹${currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        )}
      </h5>
      <p>Current Balance</p>
    </div>
    <div className="summary-card">
      <h5>
        {isLoading ? (
          <span className="loading-text">Loading...</span>
        ) : (
          `₹${totalAdded.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        )}
      </h5>
      <p>Total Added</p>
    </div>
    <div className="summary-card">
      <h5>
        {isLoading ? (
          <span className="loading-text">Loading...</span>
        ) : (
          `₹${totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        )}
      </h5>
      <p>Total Withdrawn</p>
    </div>
  </div>
);

// Funds Table Component
const FundsTable = ({ history, isLoading }) => (
  <div className="order-table">
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Symbol</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Amount</th>
          <th>P&L</th>
        </tr>
      </thead>
      <tbody>
        {history.map((h, idx) => (
          <FundsRow key={idx} transaction={h} isLoading={isLoading} />
        ))}
      </tbody>
    </table>
  </div>
);

// Individual Row Component
const FundsRow = ({ transaction, isLoading }) => (
  <tr>
    <td>
      {new Date(transaction.createdAt).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}
    </td>
    <td>
      <span className={`transaction-type ${transaction.type.toLowerCase()}`}>
        {transaction.type}
      </span>
    </td>
    <td>{transaction.symbol || '-'}</td>
    <td>{transaction.qty || '-'}</td>
    <td>{transaction.price ? `₹${transaction.price.toFixed(2)}` : '-'}</td>
    <td>₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
    <td>
      {transaction.type === 'SELL' && transaction.profitLoss !== undefined ? (
        <span className={transaction.profitLoss >= 0 ? "profit" : "loss"}>
          {transaction.profitLoss >= 0 ? '+' : ''}₹{transaction.profitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ) : (
        '-'
      )}
    </td>
  </tr>
);

// Modal Component
const FundsModal = ({ isOpen, mode, amount, error, loading, onClose, onAmountChange, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{mode === 'ADD' ? 'Add Funds' : 'Withdraw Funds'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="form-input"
              placeholder="Enter amount"
            />
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn ${mode === 'ADD' ? 'btn-success' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'ADD' ? 'Add Funds' : 'Withdraw')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Funds;
