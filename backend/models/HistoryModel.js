const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ADD_FUNDS', 'WITHDRAW', 'BUY', 'SELL'], required: true },
  amount: { type: Number, required: true },
  symbol: { type: String },
  qty: { type: Number },
  price: { type: Number },
  // Profit/Loss field for SELL transactions
  profitLoss: { type: Number, default: 0 }, // Absolute profit/loss amount
}, { timestamps: true });

const HistoryModel = mongoose.model('History', HistorySchema);
module.exports = HistoryModel;


