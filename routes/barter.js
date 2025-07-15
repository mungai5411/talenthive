const express = require('express');
const { body, validationResult } = require('express-validator');
const BarterRequest = require('../models/BarterRequest');
const User = require('../models/User');
const Review = require('../models/Review');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/barter/create
// @desc    Create a new barter request
// @access  Private
router.post('/create', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('requestedSkill.skill').trim().notEmpty().withMessage('Requested skill is required'),
  body('requestedSkill.category').notEmpty().withMessage('Requested skill category is required'),
  body('requestedSkill.description').trim().notEmpty().withMessage('Requested skill description is required'),
  body('requestedSkill.urgency').notEmpty().withMessage('Urgency level is required'),
  body('requestedSkill.estimatedHours').isNumeric().withMessage('Estimated hours must be a number'),
  body('offeredSkill.skill').trim().notEmpty().withMessage('Offered skill is required'),
  body('offeredSkill.category').notEmpty().withMessage('Offered skill category is required'),
  body('offeredSkill.description').trim().notEmpty().withMessage('Offered skill description is required'),
  body('offeredSkill.level').notEmpty().withMessage('Skill level is required'),
  body('offeredSkill.estimatedHours').isNumeric().withMessage('Estimated hours must be a number'),
  body('provider').isMongoId().withMessage('Invalid provider ID'),
  body('meetingPreference').notEmpty().withMessage('Meeting preference is required'),
  body('deadline').isISO8601().withMessage('Valid deadline is required')
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
      title,
      requestedSkill,
      offeredSkill,
      provider,
      meetingPreference,
      location,
      deadline,
      tags
    } = req.body;

    // Check if provider exists
    const providerUser = await User.findById(provider);
    if (!providerUser) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Create barter request
    const barterRequest = new BarterRequest({
      requester: req.user.id,
      provider,
      title,
      requestedSkill,
      offeredSkill,
      meetingPreference,
      location,
      deadline: new Date(deadline),
      tags: tags || []
    });

    await barterRequest.save();

    // Update user's active barters count
    await User.findByIdAndUpdate(req.user.id, { $inc: { activeBarters: 1 } });

    // Populate the response
    const populatedBarter = await BarterRequest.findById(barterRequest._id)
      .populate('requester', 'firstName lastName avatar university')
      .populate('provider', 'firstName lastName avatar university');

    res.status(201).json({
      success: true,
      message: 'Barter request created successfully',
      data: { barter: populatedBarter }
    });

  } catch (error) {
    console.error('Create barter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barter
// @desc    Get barter requests (with filtering)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      status,
      skill,
      category,
      county,
      page = 1,
      limit = 20,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // Build search criteria
    if (status) query.status = status;
    if (skill) {
      query.$or = [
        { 'requestedSkill.skill': { $regex: skill, $options: 'i' } },
        { 'offeredSkill.skill': { $regex: skill, $options: 'i' } }
      ];
    }
    if (category) {
      query.$or = [
        { 'requestedSkill.category': category },
        { 'offeredSkill.category': category }
      ];
    }
    if (county) {
      query['location.county'] = { $regex: county, $options: 'i' };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'deadline':
        sortOptions = { deadline: 1 };
        break;
      case 'priority':
        sortOptions = { priority: -1, createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const barters = await BarterRequest.find(query)
      .populate('requester', 'firstName lastName avatar university rating')
      .populate('provider', 'firstName lastName avatar university rating')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BarterRequest.countDocuments(query);

    res.json({
      success: true,
      data: {
        barters,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get barters error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barter/:id
// @desc    Get single barter request
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const barter = await BarterRequest.findById(req.params.id)
      .populate('requester', 'firstName lastName avatar university rating phone whatsapp')
      .populate('provider', 'firstName lastName avatar university rating phone whatsapp')
      .populate('messages.sender', 'firstName lastName avatar');

    if (!barter) {
      return res.status(404).json({
        success: false,
        message: 'Barter request not found'
      });
    }

    res.json({
      success: true,
      data: { barter }
    });

  } catch (error) {
    console.error('Get barter error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/barter/:id/status
// @desc    Update barter request status
// @access  Private
router.put('/:id/status', auth, [
  body('status').notEmpty().withMessage('Status is required')
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

    const { status } = req.body;
    const barter = await BarterRequest.findById(req.params.id);

    if (!barter) {
      return res.status(404).json({
        success: false,
        message: 'Barter request not found'
      });
    }

    // Check if user is involved in the barter
    if (barter.requester.toString() !== req.user.id && barter.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this barter request'
      });
    }

    await barter.updateStatus(status, req.user.id);

    // Update user stats based on status
    if (status === 'completed') {
      await User.findByIdAndUpdate(barter.requester, { $inc: { completedBarters: 1, activeBarters: -1 } });
      await User.findByIdAndUpdate(barter.provider, { $inc: { completedBarters: 1, activeBarters: -1 } });
    } else if (status === 'cancelled') {
      await User.findByIdAndUpdate(barter.requester, { $inc: { activeBarters: -1 } });
      await User.findByIdAndUpdate(barter.provider, { $inc: { activeBarters: -1 } });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { barter }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/barter/:id/message
// @desc    Add message to barter request
// @access  Private
router.post('/:id/message', auth, [
  body('message').trim().notEmpty().withMessage('Message is required')
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

    const { message } = req.body;
    const barter = await BarterRequest.findById(req.params.id);

    if (!barter) {
      return res.status(404).json({
        success: false,
        message: 'Barter request not found'
      });
    }

    // Check if user is involved in the barter
    if (barter.requester.toString() !== req.user.id && barter.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to message in this barter request'
      });
    }

    await barter.addMessage(req.user.id, message);

    res.json({
      success: true,
      message: 'Message added successfully'
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/barter/my/requests
// @desc    Get user's barter requests
// @access  Private
router.get('/my/requests', auth, async (req, res) => {
  try {
    const { status, type = 'all' } = req.query;

    let query = {};
    
    if (type === 'requested') {
      query.requester = req.user.id;
    } else if (type === 'providing') {
      query.provider = req.user.id;
    } else {
      query.$or = [
        { requester: req.user.id },
        { provider: req.user.id }
      ];
    }

    if (status) query.status = status;

    const barters = await BarterRequest.find(query)
      .populate('requester', 'firstName lastName avatar university')
      .populate('provider', 'firstName lastName avatar university')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { barters }
    });

  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/barter/:id/review
// @desc    Add review for completed barter
// @access  Private
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  body('wasBarterSuccessful').isBoolean().withMessage('wasBarterSuccessful must be a boolean'),
  body('wouldRecommend').isBoolean().withMessage('wouldRecommend must be a boolean')
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
      rating,
      comment,
      detailedRatings,
      skillsReviewed,
      tags,
      wasBarterSuccessful,
      wouldRecommend
    } = req.body;

    const barter = await BarterRequest.findById(req.params.id);

    if (!barter) {
      return res.status(404).json({
        success: false,
        message: 'Barter request not found'
      });
    }

    if (barter.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed barters'
      });
    }

    // Determine reviewee
    let reviewee;
    if (barter.requester.toString() === req.user.id) {
      reviewee = barter.provider;
    } else if (barter.provider.toString() === req.user.id) {
      reviewee = barter.requester;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this barter'
      });
    }

    // Create review
    const review = new Review({
      reviewer: req.user.id,
      reviewee,
      relatedBarter: barter._id,
      rating,
      comment,
      detailedRatings,
      skillsReviewed,
      tags,
      wasBarterSuccessful,
      wouldRecommend
    });

    await review.save();

    // Update user's rating
    const userReviews = await Review.find({ reviewee, 'moderation.status': 'approved' });
    const averageRating = userReviews.reduce((acc, rev) => acc + rev.rating, 0) / userReviews.length;
    
    await User.findByIdAndUpdate(reviewee, {
      'rating.average': averageRating,
      'rating.count': userReviews.length
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;