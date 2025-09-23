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

  // Color palette for different stocks
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
    '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40', '#C9CBCF'
  ];

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
      const response = await axios.get("http://localhost:8000/holdings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching holdings:", error);
      setError("Failed to load holdings data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (holdings.length === 0) return null;

    const chartData = holdings.map((holding, index) => {
      const currentValue = holding.currentValue || (holding.qty * holding.price);
      return {
        symbol: holding.symbol || holding.name,
        value: currentValue,
        color: colors[index % colors.length],
        qty: holding.qty,
        avgPrice: holding.avg,
        currentPrice: holding.currentPrice || holding.price
      };
    });

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
          <h2>Holdings Legend</h2>
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
