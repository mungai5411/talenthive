const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'talenthive_secret_key',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('university').trim().notEmpty().withMessage('University is required'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('yearOfStudy').isInt({ min: 1, max: 7 }).withMessage('Year of study must be between 1 and 7'),
  body('graduationYear').isInt({ min: 2020, max: 2035 }).withMessage('Please provide a valid graduation year'),
  body('county').trim().notEmpty().withMessage('County is required'),
  body('town').trim().notEmpty().withMessage('Town is required'),
  body('phone').optional().matches(/^(\+254|0)[17]\d{8}$/).withMessage('Please provide a valid Kenyan phone number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      university,
      course,
      yearOfStudy,
      graduationYear,
      county,
      town,
      phone,
      whatsapp,
      bio,
      skillsOffered,
      skillsNeeded,
      preferences
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      university,
      course,
      yearOfStudy,
      graduationYear,
      county,
      town,
      phone,
      whatsapp,
      bio,
      skillsOffered: skillsOffered || [],
      skillsNeeded: skillsNeeded || [],
      preferences: preferences || {}
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user info (without password)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: user.university,
      course: user.course,
      yearOfStudy: user.yearOfStudy,
      graduationYear: user.graduationYear,
      county: user.county,
      town: user.town,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active
    user.updateLastActive();

    // Generate token
    const token = generateToken(user._id);

    // Return user info (without password)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: user.university,
      course: user.course,
      yearOfStudy: user.yearOfStudy,
      graduationYear: user.graduationYear,
      county: user.county,
      town: user.town,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      isVerified: user.isVerified,
      skillsOffered: user.skillsOffered,
      skillsNeeded: user.skillsNeeded,
      preferences: user.preferences,
      completedBarters: user.completedBarters,
      activeBarters: user.activeBarters,
      lastActive: user.lastActive,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      university: user.university,
      course: user.course,
      yearOfStudy: user.yearOfStudy,
      graduationYear: user.graduationYear,
      county: user.county,
      town: user.town,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      isVerified: user.isVerified,
      skillsOffered: user.skillsOffered,
      skillsNeeded: user.skillsNeeded,
      preferences: user.preferences,
      completedBarters: user.completedBarters,
      activeBarters: user.activeBarters,
      lastActive: user.lastActive,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    // Generate new token
    const token = generateToken(req.user.id);

    res.json({
      success: true,
      data: { token }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In a JWT system, logout is typically handled client-side
    // But we can update the user's last active timestamp
    await req.user.updateLastActive();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;