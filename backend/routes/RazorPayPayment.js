const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const verifyToken = require("../Middlewares/verifyToken");
const UsersModel = require("../models/UsersModel");
const HistoryModel = require("../models/HistoryModel");

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// 1. Create Razorpay order for wallet funding
router.post("/wallet/add/create-order", verifyToken, async (req, res) => {
  try {
    console.log("Creating wallet funding order for user:", req.user.id);
    console.log("Request body:", req.body);
    
    const { amount } = req.body;
    const userId = req.user.id;

    // Check if Razorpay credentials are configured
    if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
      console.error("Razorpay credentials not configured");
      return res.status(500).json({ 
        success: false, 
        message: "Payment gateway not configured" 
      });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid amount" 
      });
    }

    // Check minimum amount (₹1)
    if (amount < 1) {
      return res.status(400).json({ 
        success: false, 
        message: "Minimum amount is ₹1" 
      });
    }

    // Check maximum amount (₹1,00,000)
    if (amount > 100000) {
      return res.status(400).json({ 
        success: false, 
        message: "Maximum amount is ₹1,00,000" 
      });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `wf_${Date.now()}`, // Shortened receipt (max 40 chars)
      notes: {
        userId: userId,
        type: "wallet_funding",
        amount: amount
      }
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Wallet funding order created successfully:", order.id);

    res.status(200).json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (err) {
    console.error("Error creating wallet funding order:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error creating payment order",
      error: err.message 
    });
  }
});

// 2. Verify payment and add funds to wallet
router.post("/wallet/add/verify-payment", verifyToken, async (req, res) => {
  try {
    console.log("Verifying wallet payment with data:", req.body);
    
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    const userId = req.user.id;

    // Check if Razorpay credentials are configured
    if (!process.env.KEY_SECRET) {
      console.error("Razorpay key secret not configured");
      return res.status(500).json({ 
        success: false, 
        message: "Payment gateway not configured" 
      });
    }

    // Verify the payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log("Signature verification:", {
      received: razorpay_signature,
      expected: expectedSign,
      match: razorpay_signature === expectedSign
    });

    if (razorpay_signature !== expectedSign) {
      console.error("Invalid payment signature");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    // Get the order details from Razorpay to verify amount
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const orderAmountInPaise = order.amount; // Amount in paise from Razorpay
    const expectedAmountInPaise = amount; // Convert frontend amount to paise

    console.log("Amount verification:", {
      frontendAmount: amount,
      expectedPaise: expectedAmountInPaise,
      razorpayPaise: orderAmountInPaise,
      match: orderAmountInPaise === expectedAmountInPaise
    });

    if (orderAmountInPaise !== expectedAmountInPaise) {
      console.error("Amount mismatch:", orderAmountInPaise, "vs", expectedAmountInPaise);
      return res.status(400).json({ 
        success: false, 
        message: "Amount mismatch" 
      });
    }

    const correctedAmount = amount / 100; //correct paisa to rupees

    // Find user and update wallet
    const user = await UsersModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Update user's wallet
    const newPoints = (user.points || 0) + correctedAmount;
    const newTotalAdded = (user.totalPointsAdded || 0) + correctedAmount;

    await UsersModel.findByIdAndUpdate(userId, {
      points: newPoints,
      totalPointsAdded: newTotalAdded
    });

    // Create transaction history record
    const historyRecord = new HistoryModel({
      userId: userId,
      type: "ADD_FUNDS",
      amount: correctedAmount,
      description: `Wallet funding via Razorpay - Order: ${razorpay_order_id}`,
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      paymentMethod: "Razorpay",
      status: "completed"
    });

    await historyRecord.save();

    console.log(`Successfully added ₹${amount} to user ${userId}'s wallet`);

    res.status(200).json({ 
      success: true, 
      message: "Funds added successfully",
      data: {
        newBalance: newPoints,
        amountAdded: amount,
        transactionId: razorpay_payment_id
      }
    });

  } catch (err) {
    console.error("Error verifying wallet payment:", err);
    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed" 
    });
  }
});

// 3. Get payment status (optional - for checking payment status)
router.get("/wallet/payment-status/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Fetch order from Razorpay
    const order = await razorpay.orders.fetch(orderId);
    
    // Check if this order belongs to the user
    if (order.notes && order.notes.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized access to order" 
      });
    }

    res.status(200).json({ 
      success: true, 
      order: {
        id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        status: order.status,
        created_at: order.created_at
      }
    });

  } catch (err) {
    console.error("Error fetching payment status:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching payment status" 
    });
  }
});

// 4. Get Razorpay key for frontend (public key only)
router.get("/razorpay-key", (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      key: process.env.KEY_ID 
    });
  } catch (err) {
    console.error("Error fetching Razorpay key:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching payment key" 
    });
  }
});

module.exports = router;
