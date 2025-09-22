const express = require('express');
const router = express.Router();
const verifyToken = require('../Middlewares/verifyToken');
const UsersModel = require('../models/UsersModel');
const HistoryModel = require('../models/HistoryModel');

// Get funds summary
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await UsersModel.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const history = await HistoryModel.find({ userId: user._id }).sort({ createdAt: -1 }).limit(15);
    res.json({ points: user.points || 0, totalPointsAdded: user.totalPointsAdded || 0, history });
  } catch (error) {
    console.error('Funds endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CSV Export endpoint
router.get('/export-csv', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UsersModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all transaction history for the user
    const history = await HistoryModel.find({ userId }).sort({ createdAt: -1 });
    
    // Group transactions by month
    const monthlyData = {};
    history.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          monthName,
          transactions: []
        };
      }
      
      // Format date and time properly
      const formattedDate = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const formattedTime = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      monthlyData[monthKey].transactions.push({
        date: formattedDate,
        time: formattedTime,
        type: transaction.type,
        symbol: transaction.symbol || '-',
        qty: transaction.qty || '-',
        price: transaction.price ? `₹${transaction.price.toFixed(2)}` : '-',
        amount: `₹${transaction.amount.toFixed(2)}`
      });
    });

    // Generate CSV content
    let csvContent = '';
    
    // Add header
    csvContent += `Funds Transfer History for ${user.name}\n`;
    csvContent += `Generated on: ${new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })}\n\n`;
    
    // Add monthly sections
    const sortedMonths = Object.keys(monthlyData).sort().reverse();
    
    sortedMonths.forEach(monthKey => {
      const monthData = monthlyData[monthKey];
      csvContent += `=== ${monthData.monthName} ===\n`;
      csvContent += 'Date,Time,Transaction Type,Symbol,Quantity,Price,Amount\n';
      
      monthData.transactions.forEach(transaction => {
        csvContent += `"${transaction.date}","${transaction.time}","${transaction.type}","${transaction.symbol}","${transaction.qty}","${transaction.price}","${transaction.amount}"\n`;
      });
      
      csvContent += '\n';
    });
    
    // Calculate summary statistics
    const typeSummary = {};
    let totalAdded = 0;
    let totalWithdrawn = 0;
    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    
    history.forEach(transaction => {
      typeSummary[transaction.type] = (typeSummary[transaction.type] || 0) + 1;
      
      if (transaction.type === 'ADD_FUNDS') {
        totalAdded += transaction.amount;
      } else if (transaction.type === 'WITHDRAW') {
        totalWithdrawn += transaction.amount;
      } else if (transaction.type === 'BUY') {
        totalBuyAmount += transaction.amount;
      } else if (transaction.type === 'SELL') {
        totalSellAmount += transaction.amount;
      }
    });
    
    // Add comprehensive summary
    csvContent += '=== SUMMARY ===\n';
    csvContent += `Total Transactions: ${history.length}\n`;
    csvContent += `Current Balance: ₹${(user.points || 0).toFixed(2)}\n\n`;
    
    csvContent += '=== FINANCIAL SUMMARY ===\n';
    csvContent += `Total Amount Added: ₹${totalAdded.toFixed(2)}\n`;
    csvContent += `Total Amount Withdrawn: ₹${totalWithdrawn.toFixed(2)}\n`;
    csvContent += `Total Buy Amount: ₹${totalBuyAmount.toFixed(2)}\n`;
    csvContent += `Total Sell Amount: ₹${totalSellAmount.toFixed(2)}\n`;
    csvContent += `Net Cash Flow: ₹${(totalAdded - totalWithdrawn).toFixed(2)}\n\n`;
    
    csvContent += '=== TRANSACTION BREAKDOWN ===\n';
    Object.entries(typeSummary).forEach(([type, count]) => {
      csvContent += `${type}: ${count} transactions\n`;
    });
    
    // Set headers for file download
    const filename = `${user.name.replace(/\s+/g, '-').toLowerCase()}-funds.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
