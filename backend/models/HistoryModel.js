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
  transactionId: { type: String },
  orderId: { type: String }, // Razorpay order ID
  description: { type: String }, // Transaction description
  paymentMethod: { type: String, enum: ['Razorpay', 'Manual', 'System'], default: 'System' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'completed' },
}, { timestamps: true });

const HistoryModel = mongoose.model('History', HistorySchema);
module.exports = HistoryModel;