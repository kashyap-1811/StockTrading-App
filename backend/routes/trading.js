const express = require('express');
const router = express.Router();
const verifyToken = require('../Middlewares/verifyToken');
const HoldingsModel = require('../models/HoldingsModel');
const UsersModel = require('../models/UsersModel');
const HistoryModel = require('../models/HistoryModel');

// Helper function to clean symbol (remove .NS suffix)
const cleanSymbol = (symbol) => {
  return symbol.replace('.NS', '');
};

// Get user holdings
router.get('/holdings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userHoldings = await HoldingsModel.find({ userId });
    res.json(userHoldings);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place BUY: creates/updates holding and deducts points
router.post('/buy', verifyToken, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    const userId = req.user.id;

    if (!symbol || !qty || !price || qty <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Clean the symbol to ensure consistency
    const cleanedSymbol = cleanSymbol(symbol);

    const user = await UsersModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cost = qty * price;
    if (user.points < cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // upsert holding
    let holding = await HoldingsModel.findOne({ userId, symbol: cleanedSymbol });
    if (!holding) {
      holding = new HoldingsModel({
        userId,
        symbol: cleanedSymbol,
        name: cleanedSymbol, // Use cleaned symbol as name for now
        qty,
        avg: price,
        price: cost
      });
    } else {
      const totalQty = holding.qty + qty;
      const totalCost = holding.avg * holding.qty + price * qty;
      holding.avg = totalCost / totalQty;
      holding.qty = totalQty;
      holding.price = price;
    }
    await holding.save();

    // link holding to user if new
    if (!user.holdings.includes(holding._id)) {
      user.holdings.push(holding._id);
    }

    // deduct points
    user.points -= cost;
    await user.save();

    // history
    await HistoryModel.create({ userId, type: 'BUY', amount: cost, symbol: cleanedSymbol, qty, price });

    res.status(201).json({ success: true, holding, points: user.points });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place SELL: reduces holding and adds points
router.post('/sell', verifyToken, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    const userId = req.user.id;

    if (!symbol || !qty || !price || qty <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Clean the symbol to ensure consistency
    const cleanedSymbol = cleanSymbol(symbol);

    const user = await UsersModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let holding = await HoldingsModel.findOne({ userId, symbol: cleanedSymbol });
    if (!holding || holding.qty < qty) {
      return res.status(400).json({ error: 'Insufficient holdings' });
    }

    holding.qty -= qty;
    holding.price = price;
    await holding.save();

    // remove empty holding from user's list
    if (holding.qty === 0) {
      await HoldingsModel.deleteOne({ _id: holding._id });
      user.holdings = user.holdings.filter(hId => hId.toString() !== holding._id.toString());
    }

    // Calculate profit/loss
    const proceeds = qty * price;
    const costBasis = qty * holding.avg; // Cost basis for the sold quantity
    const profitLoss = proceeds - costBasis; // Positive = profit, Negative = loss
    
    // Update user's total profit/loss
    user.totalProfitLoss += profitLoss;
    user.points += proceeds;
    await user.save();

    await HistoryModel.create({ 
      userId, 
      type: 'SELL', 
      amount: proceeds, 
      symbol: cleanedSymbol, 
      qty, 
      price,
      profitLoss: profitLoss
    });

    res.status(201).json({ success: true, points: user.points });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
