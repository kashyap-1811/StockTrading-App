// Imports
require('dotenv').config();

// express
const express = require('express');
const app = express();
const router = express.Router();

// mongoose
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;
const URI = process.env.MONGO_URL;

// models
const HoldingsModel = require('./models/HoldingsModel');
const PositionsModel = require('./models/PositionsModel');
const OrdersModel = require('./models/OrdersModel');
const UsersModel = require('./models/UsersModel');

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

app.get('/holdings', async (req, res) => {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
});

app.get('/positions', async (req, res) => {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
});

app.post('/newOrder', async (req, res) => {
    const { name, qty, price, mode } = req.body;

    // Create a new order
    const newOrder = new OrdersModel({
        name,
        qty,
        price,
        mode
    });

    try {
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating new order:', error); // for logging
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --------------------------------------------------------------------------------------------------------
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

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Check if user exists
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 4. Login successful
    return res.status(200).json({
      success: true,
      message: "Login successful"
    });
  } catch (error) {
    console.error("Login error:", error); // for logging
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