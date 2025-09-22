// Imports
require('dotenv').config();

// express
const express = require('express');
const app = express();
const router = express.Router();

// mongoose
const mongoose = require('mongoose');
const PORT = process.env.PORT;
const URI = process.env.MONGO_URL;

// models
const HoldingsModel = require('./models/HoldingsModel');
// Orders removed
const UsersModel = require('./models/UsersModel');
const HistoryModel = require('./models/HistoryModel');

// services
const stockService = require('./services/stockService');

// Passport OAuth
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// cors
const cors = require('cors');
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcryptjs");

// jwt
const jwt = require("jsonwebtoken");
const verifyToken = require("./Middlewares/verifyToken.js");

// --------------------------------------------------------------------------------------------------------
// MongoDB Connection
mongoose.connect(URI)
.then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Passport Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google OAuth profile received:', profile);
        const { id: googleId, emails, displayName, photos } = profile;
        const email = emails[0].value;
        const name = displayName;
        const profilePicture = photos[0]?.value;

        console.log('Processing user:', { email, name, googleId });

        // Check if user exists
        let user = await UsersModel.findOne({ email });
        
        if (user) {
            console.log('Existing user found:', user.email);
            // Update existing user with Google ID if not present
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = profilePicture;
                await user.save();
                console.log('Updated existing user with Google ID');
            }
            return done(null, user);
        } else {
            console.log('Creating new user');
            // Create new user
            user = new UsersModel({
                name,
                email,
                googleId,
                profilePicture,
                kycStatus: 'pending',
                points: 0,
                totalPointsAdded: 0
            });
            await user.save();
            console.log('New user created:', user.email);
            return done(null, user);
        }
    } catch (error) {
        return done(error, null);
    }
  }));
} else {
  console.log('Google OAuth not configured - skipping Google strategy setup');
}

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await UsersModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});


// --------------------------------------------------------------------------------------------------------
// server start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// --------------------------------------------------------------------------------------------------------
// Import route files
const { authRoutes, userRoutes, stockRoutes, tradingRoutes, fundsRoutes } = require('./routes');

// --------------------------------------------------------------------------------------------------------
// Basic route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// --------------------------------------------------------------------------------------------------------
// Use route files
app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/stocks', stockRoutes);
app.use('/', tradingRoutes);
app.use('/funds', fundsRoutes);

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------