// Imports
require('dotenv').config();

// express
const express = require('express');
const app = express();

// mongoose
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8000;
const URI = process.env.MONGO_URL;

// models
const HoldingsModel = require('./models/HoldingsModel');
const PositionsModel = require('./models/PositionsModel');
const OrdersModel = require('./models/OrdersModel');

// cors
const cors = require('cors');
app.use(cors());

// body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());

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
