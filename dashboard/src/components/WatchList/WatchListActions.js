import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GeneralContext from "../../contexts/GeneralContext";
import BuyModal from './BuyModal';

import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import Tooltip from "@mui/material/Tooltip";
import Grow from "@mui/material/Grow";

const WatchListActions = ({ stock, uid, companyName }) => {
  const navigate = useNavigate();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [walletPoints, setWalletPoints] = useState(0);

  useEffect(() => {
    loadWalletPoints();
  }, []);

  const loadWalletPoints = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8000/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWalletPoints(response.data?.points || 0);
    } catch (error) {
      setWalletPoints(0);
    }
  };

  const handleBuyClick = () => {
    setIsBuyModalOpen(true);
  };

  const handleBuySuccess = (cost) => {
    setWalletPoints(prev => prev - cost);
    setIsBuyModalOpen(false);
    // Trigger holdings refresh
    window.dispatchEvent(new CustomEvent('holdingsUpdated'));
  };

  const handleAnalyticsClick = () => {
    navigate(`/stock/${uid}`);
  };

  return (
    <>
      <span className="actions">
        <span className="action-buttons">
          <Tooltip
            title="Buy (B)"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button className="buy-btn" onClick={handleBuyClick}>
              Buy
            </button>
          </Tooltip>
          
          <Tooltip
            title="Analytics (A)"
            placement="top"
            arrow
            TransitionComponent={Grow}
          >
            <button className="action-btn" onClick={handleAnalyticsClick}>
              <BarChartOutlined className="icon" />
            </button>
          </Tooltip>
        </span>
      </span>

      {isBuyModalOpen && (
        <BuyModal
          stock={stock}
          uid={uid}
          companyName={companyName}
          walletPoints={walletPoints}
          onClose={() => setIsBuyModalOpen(false)}
          onSuccess={handleBuySuccess}
        />
      )}
    </>
  );
};

export default WatchListActions;
