import React, { useState } from 'react';
import WatchListActions from './WatchListActions';

const WatchListItem = ({ stock }) => {
  const [showActions, setShowActions] = useState(false);

  const handleMouseEnter = () => setShowActions(true);
  const handleMouseLeave = () => setShowActions(false);

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
            <p className={`stock-symbol ${stock.isDown ? "down" : "up"}`}>
              {stock.symbol}
            </p>
            <span className="stock-price">
              {stock.currency}{formatPrice(stock.price)}
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
