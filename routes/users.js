const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/profile/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's reviews
    const reviews = await Review.find({ 
      reviewee: req.params.id, 
      'moderation.status': 'approved' 
    })
    .populate('reviewer', 'firstName lastName avatar')
    .sort('-createdAt')
    .limit(10);

    // Calculate detailed stats
    const stats = {
      totalReviews: reviews.length,
      averageRating: user.rating.average,
      completedBarters: user.completedBarters,
      activeBarters: user.activeBarters,
      joinedDate: user.createdAt
    };

    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      university: user.university,
      course: user.course,
      yearOfStudy: user.yearOfStudy,
      county: user.county,
      town: user.town,
      avatar: user.avatar,
      bio: user.bio,
      skillsOffered: user.skillsOffered,
      skillsNeeded: user.skillsNeeded,
      rating: user.rating,
      isVerified: user.isVerified,
      stats,
      reviews: reviews.map(review => ({
        id: review._id,
        rating: review.rating,
        comment: review.comment,
        tags: review.tags,
        reviewer: review.reviewer,
        createdAt: review.createdAt
      }))
    };

    // Add contact info if user is viewing their own profile
    if (req.user && req.user.id === req.params.id) {
      userResponse.phone = user.phone;
      userResponse.whatsapp = user.whatsapp;
      userResponse.telegram = user.telegram;
      userResponse.email = user.email;
      userResponse.preferences = user.preferences;
    }

    res.json({
      success: true,
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('phone').optional().matches(/^(\+254|0)[17]\d{8}$/).withMessage('Please provide a valid Kenyan phone number'),
  body('whatsapp').optional().matches(/^(\+254|0)[17]\d{8}$/).withMessage('Please provide a valid WhatsApp number')
], async (req, res) => {
  try {
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
      bio,
      phone,
      whatsapp,
      telegram,
      skillsOffered,
      skillsNeeded,
      preferences
    } = req.body;

    const user = await User.findById(req.user.id);

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;
    if (telegram !== undefined) user.telegram = telegram;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsNeeded) user.skillsNeeded = skillsNeeded;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          skillsOffered: user.skillsOffered,
          skillsNeeded: user.skillsNeeded,
          preferences: user.preferences
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users by skills, location, university
// @access  Public
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const {
      skill,
      category,
      county,
      university,
      page = 1,
      limit = 20,
      sortBy = 'rating'
    } = req.query;

    const query = { isActive: true };

    // Build search criteria
    if (skill) {
      query.$or = [
        { 'skillsOffered.skill': { $regex: skill, $options: 'i' } },
        { 'skillsNeeded.skill': { $regex: skill, $options: 'i' } }
      ];
    }

    if (category) {
      query.$or = [
        { 'skillsOffered.category': category },
        { 'skillsNeeded.category': category }
      ];
    }

    if (county) {
      query.county = { $regex: county, $options: 'i' };
    }

    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'mostActive':
        sortOptions = { lastActive: -1 };
        break;
      default:
        sortOptions = { 'rating.average': -1 };
    }

    const users = await User.find(query)
      .select('firstName lastName university county town avatar bio skillsOffered skillsNeeded rating isVerified completedBarters')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Calculate compatibility scores if user is authenticated
    const usersWithCompatibility = users.map(user => {
      const userObj = user.toObject();
      
      if (req.user) {
        userObj.compatibilityScore = req.user.calculateCompatibility(user);
      }
      
      return userObj;
    });

    res.json({
      success: true,
      data: {
        users: usersWithCompatibility,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get user suggestions based on skills and location
// @access  Private
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    // Get users who have skills the current user needs
    const myNeededSkills = currentUser.skillsNeeded.map(s => s.skill);
    
    const suggestions = await User.find({
      _id: { $ne: req.user.id },
      isActive: true,
      'skillsOffered.skill': { $in: myNeededSkills }
    })
    .select('firstName lastName university county town avatar bio skillsOffered rating isVerified completedBarters')
    .sort({ 'rating.average': -1 })
    .limit(10);

    // Calculate compatibility scores
    const suggestionsWithScores = suggestions.map(user => {
      const userObj = user.toObject();
      userObj.compatibilityScore = currentUser.calculateCompatibility(user);
      return userObj;
    }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      success: true,
      data: { suggestions: suggestionsWithScores }
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/nearby
// @desc    Get users in the same county/town
// @access  Private
router.get('/nearby', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    const nearbyUsers = await User.find({
      _id: { $ne: req.user.id },
      isActive: true,
      county: currentUser.county,
      'preferences.availableForMeetups': true
    })
    .select('firstName lastName university town avatar bio skillsOffered rating isVerified completedBarters')
    .sort({ 'rating.average': -1 })
    .limit(20);

    res.json({
      success: true,
      data: { users: nearbyUsers }
    });

  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's reviews
    const reviews = await Review.find({ 
      reviewee: userId, 
      'moderation.status': 'approved' 
    });

    // Calculate detailed stats
    const stats = {
      totalReviews: reviews.length,
      averageRating: reviews.length > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      },
      skillsOfferedCount: req.user.skillsOffered.length,
      skillsNeededCount: req.user.skillsNeeded.length,
      completedBarters: req.user.completedBarters,
      activeBarters: req.user.activeBarters,
      joinedDate: req.user.createdAt,
      lastActive: req.user.lastActive
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;