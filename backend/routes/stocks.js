const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await stockService.getAllCompanies();
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Unable to fetch companies' });
  }
});

// Search companies by name or symbol
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const searchResults = await stockService.searchCompanies(q);
    res.json({ success: true, data: searchResults });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Unable to search companies' });
  }
});

// Get current stock price for a single symbol
router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockService.getStockPrice(symbol.toUpperCase());
    res.json({ success: true, data: stockData });
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Unable to fetch stock price' });
  }
});

// Get index data (Nifty, Sensex) using Yahoo Finance
router.get('/index/:symbol', async (req, res) => {
  try {
    let { symbol } = req.params;
    // Decode URL-encoded symbols (e.g., %5E becomes ^)
    symbol = decodeURIComponent(symbol);
    const indexData = await stockService.getIndexPrice(symbol);
    res.json({ success: true, data: indexData });
  } catch (error) {
    console.error('Error fetching index data:', error);
    res.status(500).json({ error: 'Unable to fetch index data' });
  }
});

// Get last 15 days data for analytics
router.get('/analytics/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const analyticsData = await stockService.getLast15DaysData(symbol.toUpperCase());
    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Unable to fetch analytics data' });
  }
});

module.exports = router;
