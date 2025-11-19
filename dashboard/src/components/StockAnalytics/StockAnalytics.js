import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StockAnalytics.css';

const StockAnalytics = () => {
  const { stockName } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [stockName]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:8000/stocks/analytics/${stockName}`);
      
      if (response.data.success) {
        console.log('Analytics data received:', response.data.data);
        console.log('Price data length:', response.data.data.priceData.length);
        if (response.data.data.priceData.length > 0) {
          console.log('Date range:', response.data.data.priceData[0].date, 'to', response.data.data.priceData[response.data.data.priceData.length - 1].date);
        }
        setAnalyticsData(response.data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const drawChart = () => {
    if (!analyticsData || !analyticsData.priceData.length) return;
    
    // Ensure we only use 15 days of data
    const chartData = analyticsData.priceData.slice(0, 15);

    const canvas = document.getElementById('priceChart');
    if (!canvas) return;

    // Get container dimensions for responsive sizing
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth - 40; // Account for padding
    const containerHeight = Math.max(300, Math.min(400, containerWidth * 0.5)); // Responsive height with min/max
    
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = containerWidth;
    const displayHeight = containerHeight;
    
    // Set canvas dimensions (actual pixel size - scaled for DPR)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Set CSS size for display (logical pixels)
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Scale context for high DPI
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const padding = Math.max(40, Math.min(60, displayWidth * 0.075)); // Responsive padding
    const chartWidth = displayWidth - 2 * padding;
    const chartHeight = displayHeight - 2 * padding;

    // Clear canvas (use display dimensions after scaling)
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Find min and max prices
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
    gradient.addColorStop(0, analyticsData.isGain ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(displayWidth - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (chartWidth / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, displayHeight - padding);
      ctx.stroke();
    }

    // Draw price line
    ctx.strokeStyle = analyticsData.isGain ? '#10B981' : '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index;
      const y = displayHeight - padding - ((point.price - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = analyticsData.isGain ? '#10B981' : '#EF4444';
    chartData.forEach((point, index) => {
      const x = padding + (chartWidth / (chartData.length - 1)) * index;
      const y = displayHeight - padding - ((point.price - minPrice) / priceRange) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add white border to points
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Y-axis labels
    ctx.fillStyle = '#6b7280';
    const fontSize = Math.max(10, Math.min(12, displayWidth * 0.015)); // Responsive font size
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const value = minPrice + (priceRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(formatCurrency(value), padding - 10, y + 4);
    }

    // Draw X-axis labels (dates)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    const xAxisFontSize = Math.max(9, Math.min(11, displayWidth * 0.014)); // Responsive font size
    ctx.font = `${xAxisFontSize}px Inter, sans-serif`;
    
    // Show x-axis labels - adjust frequency based on container width
    const labelInterval = displayWidth < 600 ? 4 : 3; // Show fewer labels on smaller screens
    chartData.forEach((point, index) => {
      if (index % labelInterval === 0 || index === chartData.length - 1) {
        const x = padding + (chartWidth / (chartData.length - 1)) * index;
        const date = formatDate(point.date);
        ctx.fillText(date, x, displayHeight - padding + 20);
      }
    });
  };

  useEffect(() => {
    if (analyticsData) {
      // Initial draw
      setTimeout(drawChart, 100);
      
      // Handle window resize
      const handleResize = () => {
        setTimeout(drawChart, 100);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [analyticsData]);

  if (loading) {
    return (
      <div className="stock-analytics-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stock-analytics-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchAnalyticsData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="stock-analytics-container">
        <div className="error-container">
          <div className="error-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Analytics data not available for this stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="stock-info">
          <h1 className="analytics-stock-name">{analyticsData.name}</h1>
          <p className="analytics-stock-symbol">{analyticsData.symbol}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon current">💰</div>
          <div className="card-content">
            <h3>Current Price</h3>
            <p className="price">{formatCurrency(analyticsData.currentPrice)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon start">📅</div>
          <div className="card-content">
            <h3>15 Days Ago</h3>
            <p className="price">{formatCurrency(analyticsData.firstPrice)}</p>
          </div>
        </div>

        <div className={`summary-card ${analyticsData.isGain ? 'gain' : 'loss'}`}>
          <div className="card-icon">{analyticsData.isGain ? '📈' : '📉'}</div>
          <div className="card-content">
            <h3>Gain/Loss</h3>
            <p className="price">
              {analyticsData.isGain ? '+' : ''}{formatCurrency(analyticsData.gainLoss)}
            </p>
            <p className="percentage">
              {analyticsData.isGain ? '+' : ''}{analyticsData.gainLossPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <div className="chart-wrapper">
          <canvas id="priceChart"></canvas>
        </div>
      </div>

      {/* Price Table */}
      <div className="price-table-container">
        <h3>Daily Prices (Last 15 Days) - {analyticsData.priceData.length} days</h3>
        <div className="price-table">
          <div className="table-header">
            <span>Date</span>
            <span>Price</span>
            <span>Change</span>
          </div>
          {analyticsData.priceData.slice(0, 15).map((day, index) => {
            const prevPrice = index > 0 ? analyticsData.priceData[index - 1].price : day.price;
            const change = day.price - prevPrice;
            const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
            
            return (
              <div key={index} className="table-row">
                <span className="date">{formatDate(day.date)}</span>
                <span className="price">{formatCurrency(day.price)}</span>
                <span className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
                  {change >= 0 ? '+' : ''}{formatCurrency(change)} 
                  ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StockAnalytics;
