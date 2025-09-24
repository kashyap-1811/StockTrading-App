const express = require('express');
const router = express.Router();
const verifyToken = require('../Middlewares/verifyToken');
const UsersModel = require('../models/UsersModel');
const HistoryModel = require('../models/HistoryModel');

// Verify token route
router.get("/verify", verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get current user profile
router.get('/me', verifyToken, async (req, res) => {
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
router.put('/profile/update', verifyToken, async (req, res) => {
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

module.exports = router;
