const mongoose = require('mongoose');

const HoldingsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    avg: { type: Number, required: true },
    price: { type: Number, required: true },
    net: { type: String, required: true },
    day: { type: String, required: true }
});

const HoldingsModel = mongoose.model('Holdings', HoldingsSchema);
module.exports = HoldingsModel;
