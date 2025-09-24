import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useStockContext } from '../../contexts/StockContext';
import './Summary.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Summary = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getCompanyData, companies, loading: companiesLoading, isConnected } = useStockContext();

  useEffect(() => {
    fetchHoldings();
  }, []);

  // Listen for holdings updates
  useEffect(() => {
    const handleHoldingsUpdate = () => {
      fetchHoldings();
    };

    window.addEventListener('holdingsUpdated', handleHoldingsUpdate);
    return () => window.removeEventListener('holdingsUpdated', handleHoldingsUpdate);
  }, []);

  // Update holdings with current prices when companies data changes
  useEffect(() => {
    if (holdings.length > 0 && companies.length > 0) {
      const updatedHoldings = holdings.map(holding => {
        const companyData = getCompanyData(holding.symbol);
        
        if (companyData) {
          const currentPrice = companyData.price;
          const currentValue = holding.qty * currentPrice;
          
          return {
            ...holding,
            currentPrice: currentPrice,
            currentValue: currentValue
          };
        }
        
        return holding;
      });
      
      setHoldings(updatedHoldings);
    }
  }, [companies, getCompanyData]);

  const fetchHoldings = async () => {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const rawHoldings = await axios.get("http://localhost:8000/holdings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Merge holdings by symbol
      const mergedHoldings = Object.values(
        rawHoldings.data.reduce((acc, item) => {
          if (!acc[item.symbol]) {
            acc[item.symbol] = { ...item }; // copy first occurrence
          } else {
            // Example: combine quantity & adjust average price
            acc[item.symbol].qty += item.qty;

            // You can also decide how to handle "price" field
            acc[item.symbol].price += item.price; // keep latest price
          }
          return acc;
        }, {})
      );

      setHoldings(mergedHoldings);
      setError(null);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      setError("Failed to load holdings data");
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360); // 0–359 (full spectrum)
    const saturation = 70 + Math.random() * 30;  // 70–100% (vivid colors)
    const lightness = 40 + Math.random() * 20;   // 40–60% (not too dark/light)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (holdings.length === 0) return null;

    const chartData = holdings.map((holding, index) => {
      const currentValue = holding.currentValue || (holding.qty * holding.price);
      return {
        symbol: holding.symbol || holding.name,
        value: currentValue,
        color: getRandomColor(),
        qty: holding.qty,
        avgPrice: holding.avg,
        currentPrice: holding.currentPrice || holding.price
      };
    });

    // Sort chart data by value in descending order
    chartData.sort((a, b) => b.value - a.value);
    return chartData;
  };

  const chartData = prepareChartData();

  const data = {
    labels: chartData ? chartData.map(item => item.symbol) : [],
    datasets: [
      {
        data: chartData ? chartData.map(item => item.value) : [],
        backgroundColor: chartData ? chartData.map(item => item.color) : [],
        borderColor: chartData ? chartData.map(item => item.color) : [],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create our own legend
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataIndex = context.dataIndex;
            const item = chartData[dataIndex];
            const percentage = ((item.value / chartData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1);
            return [
              `${item.symbol}`,
              `Quantity: ${item.qty}`,
              `Current Value: ₹${item.value.toFixed(2)}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <div className="summary-container">
        <div className="loading">
          <h2>Loading Holdings Summary...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-container">
        <div className="error">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="summary-container">
        <div className="no-holdings">
          <h2>No Holdings Found</h2>
          <p>You don't have any holdings yet. Start trading to see your portfolio summary here.</p>
        </div>
      </div>
    );
  }

  const totalValue = chartData ? chartData.reduce((sum, item) => sum + item.value, 0) : 0;

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h1>Portfolio Summary</h1>
        <p>Total Portfolio Value: ₹{totalValue.toFixed(2)}</p>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Live' : '🔴 Offline'}
          </span>
          <span className="status-text">
            {isConnected ? 'Real-time updates active' : 'Connection lost - using cached data'}
          </span>
        </div>
      </div>

      <div className="summary-content">
        <div className="chart-section">
          <h2>Holdings Distribution</h2>
          <div className="chart-container">
            <Pie data={data} options={options} />
          </div>
        </div>

        <div className="legend-section">
          <h2>Holdings</h2>
          <div className="legend-container">
            {chartData && chartData.map((item, index) => {
              const percentage = ((item.value / totalValue) * 100).toFixed(1);
              return (
                <div key={index} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="legend-details">
                    <div className="legend-symbol">{item.symbol}</div>
                    <div className="legend-info">
                      <span>Qty: {item.qty}</span>
                      <span>Value: ₹{item.value.toFixed(2)}</span>
                      <span>({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;
