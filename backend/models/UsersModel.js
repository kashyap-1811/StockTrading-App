const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { 
        type: String, 
        required: function() {
            // Password is required only if no OAuth provider is used
            return !this.googleId;
        }
    },
    birthday: { 
        type: Date, 
        required: function() {
            // Birthday is required only if no OAuth provider is used
            return !this.googleId;
        }
    },
    phone: { type: String, sparse: true },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    points: { type: Number, default: 0 }, // Added points field for wallet functionality
    totalPointsAdded: { type: Number, default: 0 }, // Track total points added by user
    totalProfitLoss: { type: Number, default: 0 }, // Track total profit/loss from all sell transactions
    holdings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Holdings' }],
    isActive: { type: Boolean, default: true },
    // Google OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    profilePicture: { type: String }
}, {
    timestamps: true
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;