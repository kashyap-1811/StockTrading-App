const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    birthday: { type: Date, required: true },
    phone: { type: String, unique: true },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    balance: { type: Number, default: 0 },
    holdings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Holdings' }],
    positions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Positions' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Orders' }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
