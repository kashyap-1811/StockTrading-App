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
// Google OAuth Routes
app.get('/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ 
      success: false, 
      error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  }
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res);
});

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/auth/error?message=Authentication failed' }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect('http://localhost:3000/auth/error?message=User not found');
      }

      // Generate JWT token (same as regular login)
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
      );

      // Redirect to frontend with token
      const frontendUrl = `http://localhost:3000/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profilePicture: req.user.profilePicture
      }))}`;
      
      res.redirect(frontendUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('http://localhost:3000/auth/error?message=Authentication failed');
    }
  }
);

// --------------------------------------------------------------------------------------------------------
// server start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// --------------------------------------------------------------------------------------------------------
// routes
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get("/verify", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get all companies
app.get('/stocks/companies', async (req, res) => {
  try {
    const companies = await stockService.getAllCompanies();
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Unable to fetch companies' });
  }
});

// Search companies by name or symbol
app.get('/stocks/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const searchResults = await stockService.searchCompanies(q);
    res.json({ success: true, data: searchResults });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ error: 'Unable to search companies' });
  }
});

// Get current stock price for a single symbol
app.get('/stocks/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockService.getStockPrice(symbol.toUpperCase());
    res.json({ success: true, data: stockData });
  } catch (error) {
    console.error('Error fetching stock price:', error);
    res.status(500).json({ error: 'Unable to fetch stock price' });
  }
});

// Get last 15 days data for analytics
app.get('/stocks/analytics/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const analyticsData = await stockService.getLast15DaysData(symbol.toUpperCase());
    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Unable to fetch analytics data' });
  }
});

app.get('/holdings', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userHoldings = await HoldingsModel.find({ userId });
        res.json(userHoldings);
    } catch (error) {
        console.error('Error fetching holdings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Current user profile
app.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await UsersModel.findById(req.user.id).select('-password').populate('holdings');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/profile/update', verifyToken, async (req, res) => {
  try {
    const { name, phone, birthday } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if phone number is already taken by another user
    if (phone && phone.trim().length > 0) {
      const existingUser = await UsersModel.findOne({ 
        phone: phone.trim(), 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Phone number already exists' });
      }
    }

    // Update user
    const updateData = {
      name: name.trim()
    };

    if (phone && phone.trim().length > 0) {
      updateData.phone = phone.trim();
    }

    if (birthday) {
      updateData.birthday = new Date(birthday);
    }

    const user = await UsersModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('holdings');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add wallet points
app.post('/wallet/add', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const user = await UsersModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.points = (user.points || 0) + numericAmount;
    user.totalPointsAdded = (user.totalPointsAdded || 0) + numericAmount;
    await user.save();
    await HistoryModel.create({ userId: user._id, type: 'ADD_FUNDS', amount: numericAmount });
    res.json({ success: true, points: user.points });
  } catch (error) {
    console.error('Wallet add error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Withdraw wallet points
app.post('/wallet/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const user = await UsersModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if ((user.points || 0) < numericAmount) {
      return res.status(400).json({ error: 'Insufficient points' });
    }
    user.points = (user.points || 0) - numericAmount;
    await user.save();
    await HistoryModel.create({ userId: user._id, type: 'WITHDRAW', amount: numericAmount });
    res.json({ success: true, points: user.points });
  } catch (error) {
    console.error('Wallet withdraw error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place BUY: creates/updates holding and deducts points
app.post('/buy', verifyToken, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    const userId = req.user.id;

    if (!symbol || !qty || !price || qty <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const user = await UsersModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const cost = qty * price;
    if (user.points < cost) {
      return res.status(400).json({ error: 'Insufficient points' });
    }

    // upsert holding
    let holding = await HoldingsModel.findOne({ userId, symbol: symbol });
    if (!holding) {
      holding = new HoldingsModel({
        userId,
        symbol: symbol,
        name: symbol, // Use symbol as name for now
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
    await HistoryModel.create({ userId, type: 'BUY', amount: cost, symbol, qty, price });

    res.status(201).json({ success: true, holding, points: user.points });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place SELL: reduces holding and adds points
app.post('/sell', verifyToken, async (req, res) => {
  try {
    const { symbol, qty, price } = req.body;
    const userId = req.user.id;

    if (!symbol || !qty || !price || qty <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const user = await UsersModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let holding = await HoldingsModel.findOne({ userId, symbol: symbol });
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

    // add points
    const proceeds = qty * price;
    user.points += proceeds;
    await user.save();

    await HistoryModel.create({ userId, type: 'SELL', amount: proceeds, symbol, qty, price });

    res.status(201).json({ success: true, points: user.points });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --------------------------------------------------------------------------------------------------------
// Funds summary
app.get('/funds', verifyToken, async (req, res) => {
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
app.get('/funds/export-csv', verifyToken, async (req, res) => {
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

// signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, mobile, birthday, password, confirmPassword } = req.body;

    // 1. Validate required fields
    if (!name || !email || !mobile || !birthday || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // 2. Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // 3. Check if email already exists
    const existingUser = await UsersModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // check if mobile already exists
    const existingMobile = await UsersModel.findOne({ phone: mobile });
    if (existingMobile) {
      return res.status(400).json({ success: false, message: "Mobile number already exists" });
    }

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save new user
    const newUser = new UsersModel({
      name,
      email,
      phone: mobile,
      birthday,
      password: hashedPassword,
    });

    await newUser.save();

    // 6. Redirect to dashboard with flash message
    return res.status(201).json({
      success: true,
      message: "Signup successful"
    });
  } catch (error) {
    console.error("Signup error:", error); // for logging
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Email does not Exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email }, // payload
      process.env.JWT_SECRET, // secret key
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token // send token to client
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
});

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------