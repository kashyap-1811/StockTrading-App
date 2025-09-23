const mongoose = require('mongoose');

const HoldingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true }, // Stock symbol (e.g., 'AAPL', 'GOOGL')
    name: { type: String, required: true }, // Company name
    qty: { type: Number, required: true }, // Quantity purchased
    avg: { type: Number, required: true }, // Average purchase price
    price: { type: Number, required: true } // Last transaction price (qty * avg)
}, {
    timestamps: true // This automatically creates createdAt and updatedAt fields
});

const HoldingsModel = mongoose.model('Holdings', HoldingsSchema);
module.exports = HoldingsModel;
