// Holdings.js
import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SellModal from "./SellModal";
import "./Holdings.css";

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [walletPoints, setWalletPoints] = useState(0);

  useEffect(() => {
    fetchHoldings();
    loadWallet();
  }, []);

  const fetchHoldings = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:8000/holdings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(response.data);
    } catch (error) {
      console.error("Error fetching holdings:", error);
    }
  };

  const loadWallet = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletPoints(res.data?.points || 0);
    } catch (e) {
      console.error("Error loading wallet:", e);
    }
  };

  const handleSellClick = (holding) => {
    setSelectedHolding(holding);
    setIsModalOpen(true);
  };

  const handleSellSuccess = (proceeds) => {
    setWalletPoints(prev => prev + proceeds);
    fetchHoldings(); // Refresh holdings
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHolding(null);
  };

  const totalInvestment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.price * h.qty, 0);
  const pnl = currentValue - totalInvestment;
  const pnlPercent = ((pnl / totalInvestment) * 100).toFixed(2);

  return (
    <>
      <div className="holdings-header">
        <h3>Holdings ({holdings.length})</h3>
      </div>

      <SummaryCards 
        totalInvestment={totalInvestment}
        currentValue={currentValue}
        pnl={pnl}
        pnlPercent={pnlPercent}
      />

      <HoldingsTable 
        holdings={holdings}
        onSellClick={handleSellClick}
      />

      <SellModal
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedHolding={selectedHolding}
        walletPoints={walletPoints}
        onSellSuccess={handleSellSuccess}
      />
    </>
  );
};

// Separate component for summary cards
const SummaryCards = ({ totalInvestment, currentValue, pnl, pnlPercent }) => (
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
);

// Separate component for holdings table
const HoldingsTable = ({ holdings, onSellClick }) => (
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
        {holdings.map((item, index) => (
          <HoldingRow 
            key={index}
            holding={item}
            onSellClick={onSellClick}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// Separate component for each holding row
const HoldingRow = ({ holding, onSellClick }) => {
  const currentVal = (holding.price * holding.qty).toFixed(2);
  const gain = holding.price * holding.qty - holding.avg * holding.qty;
  const gainFormatted = gain.toFixed(2);
  const isNetPositive = parseFloat(holding.net) >= 0;
  const isDayPositive = parseFloat(holding.day) >= 0;

  return (
    <tr>
      <td>{holding.name}</td>
      <td>{holding.qty}</td>
      <td>{holding.avg.toFixed(2)}</td>
      <td>{holding.price.toFixed(2)}</td>
      <td>{currentVal}</td>
      <td className={gain >= 0 ? "profit" : "loss"}>{gainFormatted}</td>
      <td className={isNetPositive ? "profit" : "loss"}>{holding.net}</td>
      <td className={isDayPositive ? "profit" : "loss"}>{holding.day}</td>
      <td>
        <button 
          onClick={() => onSellClick(holding)}
          className="sell-btn"
        >
          Sell
        </button>
      </td>
    </tr>
  );
};

export default Holdings;
