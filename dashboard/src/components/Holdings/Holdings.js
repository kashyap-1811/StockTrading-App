import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useStockContext } from "../../contexts/StockContext";
import SellModal from "./SellModal";
import "./Holdings.css";

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState(null);
  const [walletPoints, setWalletPoints] = useState(0);
  const { getCompanyData, companies, loading: companiesLoading } = useStockContext();

  useEffect(() => {
    fetchHoldings();
    loadWallet();
  }, []);

  // Listen for holdings updates from buy/sell operations
  useEffect(() => {
    const handleHoldingsUpdate = () => {
      fetchHoldings();
      loadWallet();
    };

    window.addEventListener('holdingsUpdated', handleHoldingsUpdate);
    return () => window.removeEventListener('holdingsUpdated', handleHoldingsUpdate);
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

  // Update holdings with current prices when companies data changes
  useEffect(() => {
    if (holdings.length > 0 && companies.length > 0) {
      const updatedHoldings = holdings.map(holding => {
        // Get current company data from StockContext
        const companyData = getCompanyData(holding.symbol);
        
        if (companyData) {
          const currentPrice = companyData.price;
          const totalInvested = holding.qty * holding.avg;
          const currentValue = holding.qty * currentPrice;
          const profitLoss = currentValue - totalInvested;
          const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
          
          return {
            ...holding,
            currentPrice: currentPrice,
            totalInvested: totalInvested,
            currentValue: currentValue,
            profitLoss: profitLoss,
            profitLossPercentage: profitLossPercentage
          };
        }
        
        // If no current data available, return holding as is
        return holding;
      });
      
      // Only update if there are actual changes to prevent unnecessary re-renders
      const hasChanges = updatedHoldings.some((updated, index) => {
        const original = holdings[index];
        return updated.currentPrice !== original.currentPrice ||
               updated.profitLoss !== original.profitLoss ||
               updated.profitLossPercentage !== original.profitLossPercentage;
      });
      
      if (hasChanges) {
        setHoldings(updatedHoldings);
      }
    }
  }, [companies, getCompanyData]); // Only depend on companies and getCompanyData

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
    // Holdings will be refreshed by the 'holdingsUpdated' event from SellModal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedHolding(null);
  };

  // Calculate totals using the updated holdings with current prices from StockContext
  // Only calculate when companies data is loaded
  const totalInvestment = companiesLoading ? 0 : holdings.reduce((sum, h) => sum + (h.totalInvested || h.avg * h.qty), 0);
  const currentValue = companiesLoading ? 0 : holdings.reduce((sum, h) => sum + (h.currentValue || h.price * h.qty), 0);
  const pnl = companiesLoading ? 0 : holdings.reduce((sum, h) => sum + (h.profitLoss || 0), 0);
  const pnlPercent = companiesLoading ? '0.00' : (totalInvestment > 0 ? ((pnl / totalInvestment) * 100).toFixed(2) : '0.00');

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
        isLoading={companiesLoading}
      />

      <HoldingsTable 
        holdings={holdings}
        onSellClick={handleSellClick}
        isLoading={companiesLoading}
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
const SummaryCards = ({ totalInvestment, currentValue, pnl, pnlPercent, isLoading }) => (
  <div className="summary-row">
    <div className="summary-card">
      <h5>
        {isLoading ? (
          <span style={{ color: '#999', fontSize: '14px' }}>Loading...</span>
        ) : (
          `₹${totalInvestment.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        )}
      </h5>
      <p>Total Investment</p>
    </div>
    <div className="summary-card">
      <h5>
        {isLoading ? (
          <span style={{ color: '#999', fontSize: '14px' }}>Loading...</span>
        ) : (
          `₹${currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        )}
      </h5>
      <p>Current Value</p>
    </div>
    <div className="summary-card">
      <h5 className={isLoading ? "" : (pnl >= 0 ? "profit" : "loss")}>
        {isLoading ? (
          <span style={{ color: '#999', fontSize: '14px' }}>Loading...</span>
        ) : (
          `₹${pnl.toFixed(2)} (${pnl >= 0 ? "+" : ""}${pnlPercent}%)`
        )}
      </h5>
      <p>P&L</p>
    </div>
  </div>
);

// Separate component for holdings table
const HoldingsTable = ({ holdings, onSellClick, isLoading }) => (
  <div className="order-table">
    <table>
      <thead>
        <tr>
          <th>Instrument</th>
          <th>Quantity</th>
          <th>Purchased Cost per Stock</th>
          <th>Total Cost</th>
          <th>Current Cost per Stock</th>
          <th>Profit/Loss</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((item, index) => (
          <HoldingRow 
            key={index}
            holding={item}
            onSellClick={onSellClick}
            isLoading={isLoading}
          />
        ))}
      </tbody>
    </table>
  </div>
);

// Separate component for each holding row
const HoldingRow = ({ holding, onSellClick, isLoading }) => {
  // Use current price ONLY from StockContext to ensure consistency
  const currentPrice = holding.currentPrice;
  // Calculate profit/loss only if current price is available from StockContext
  const profitLoss = currentPrice ? (currentPrice * holding.qty - holding.avg * holding.qty) : 0;
  const profitLossPercentage = currentPrice && holding.avg > 0 ? ((profitLoss / (holding.avg * holding.qty)) * 100) : 0;

  return (
    <tr>
      <td>
        <div>
          <strong>{holding.symbol || holding.name}</strong>
          <div style={{ fontSize: '12px', color: '#666' }}>{holding.name}</div>
        </div>
      </td>
      <td>{holding.qty}</td>
      <td>₹{holding.avg.toFixed(2)}</td>
      <td>₹{(holding.avg * holding.qty).toFixed(2)}</td>
      <td>
        {isLoading ? (
          <span style={{ color: '#999', fontSize: '12px' }}>Loading...</span>
        ) : currentPrice ? (
          `₹${currentPrice.toFixed(2)}`
        ) : (
          <span style={{ color: '#999', fontSize: '12px' }}>N/A</span>
        )}
      </td>
      <td className={isLoading ? "" : (currentPrice && profitLoss >= 0 ? "profit" : currentPrice && profitLoss < 0 ? "loss" : "")}>
        {isLoading ? (
          <span style={{ color: '#999', fontSize: '12px' }}>Loading...</span>
        ) : currentPrice ? (
          <>
            <div>₹{profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}</div>
            <div style={{ fontSize: '12px' }}>({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)</div>
          </>
        ) : (
          <span style={{ color: '#999', fontSize: '12px' }}>N/A</span>
        )}
      </td>
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
