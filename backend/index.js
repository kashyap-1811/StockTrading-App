// Imports
require('dotenv').config();

// express
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { backendUrl, corsAllowedOrigins, isProduction } = require('./config/appConfig');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsAllowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6
});
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
  origin: corsAllowedOrigins,
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    sameSite: 'lax',
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
      callbackURL: `${backendUrl}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleId = profile?.id;
        const email = profile?.emails?.[0]?.value?.toLowerCase();
        const profilePicture = profile?.photos?.[0]?.value;
        const safeName =
          (profile?.displayName || "").trim() || (email ? email.split('@')[0] : "");

        if (!googleId || !email) {
            return done(new Error('Google profile is missing required account data'), null);
        }

        // Try to link by Google ID first, then email
        let user = await UsersModel.findOne({ $or: [{ googleId }, { email }] });
        
        if (user) {
            let shouldSave = false;

            if (!user.googleId) {
                user.googleId = googleId;
                shouldSave = true;
            }

            if (!user.profilePicture && profilePicture) {
                user.profilePicture = profilePicture;
                shouldSave = true;
            }

            if ((!user.name || !user.name.trim()) && safeName) {
                user.name = safeName;
                shouldSave = true;
            }

            if (shouldSave) {
                await user.save();
            }

            return done(null, user);
        } else {
            // Create new user
            user = new UsersModel({
                name: safeName,
                email,
                googleId,
                profilePicture,
                kycStatus: 'pending',
                points: 0,
                totalPointsAdded: 0
            });
            await user.save();
            return done(null, user);
        }
    } catch (error) {
        console.error('Google OAuth strategy error:', error);
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
// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io available globally for stock service
global.io = io;

// --------------------------------------------------------------------------------------------------------
// server start
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Start continuous stock price updates
    const stockService = require('./services/stockService');
    stockService.startContinuousUpdates();
    console.log('Real-time stock price updates started');
});

// --------------------------------------------------------------------------------------------------------
// Import route files
const { authRoutes, userRoutes, stockRoutes, tradingRoutes, fundsRoutes, razorpayRoutes } = require('./routes');

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
app.use('/', razorpayRoutes);

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------
