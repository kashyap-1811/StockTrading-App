import React, { useState } from 'react';
import { useStockContext } from '../../contexts/StockContext';
import WatchListActions from './WatchListActions';

const WatchListItem = ({ stock }) => {
  const [showActions, setShowActions] = useState(false);
  const { getCompanyData } = useStockContext();

  const handleMouseEnter = () => setShowActions(true);
  const handleMouseLeave = () => setShowActions(false);

  // Get real-time price from StockContext
  const companyData = getCompanyData(stock.symbol);
  const currentPrice = companyData ? companyData.price : stock.price;
  const currentChange = companyData ? companyData.change : stock.change;
  const isDown = currentChange < 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <div className="stock-info">
          <div className="stock-header">
            <p className={`stock-symbol ${isDown ? "down" : "up"}`}>
              {stock.symbol}
            </p>
            <span className="stock-price">
              {stock.currency}{formatPrice(currentPrice)}
              <span className="live-indicator" title="Live price updates">🔴</span>
            </span>
          </div>
          <p className="stock-name">{stock.name}</p>
        </div>
      </div>
      
      {showActions && (
        <WatchListActions 
          stock={stock}
          uid={stock.symbol} 
          companyName={stock.name}
        />
      )}
    </li>
  );
};

export default WatchListItem;
