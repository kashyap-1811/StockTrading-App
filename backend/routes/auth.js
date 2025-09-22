const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const UsersModel = require('../models/UsersModel');

// Google OAuth Routes
router.get('/google', (req, res) => {
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

router.get('/google/callback', 
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

// Signup route
router.post("/signup", async (req, res) => {
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

// Login route
router.post("/login", async (req, res) => {
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

module.exports = router;
