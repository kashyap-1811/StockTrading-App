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

// cors
const cors = require('cors');
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));

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
    let holding = await HoldingsModel.findOne({ userId, name: symbol });
    if (!holding) {
      holding = new HoldingsModel({
        userId,
        name: symbol,
        qty,
        avg: price,
        price,
        net: '0',
        day: '0'
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

    let holding = await HoldingsModel.findOne({ userId, name: symbol });
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
    // For now, just return a success message as requested
    res.json({ message: 'CSV file generated successfully!' });
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