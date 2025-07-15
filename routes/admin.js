const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const BarterRequest = require('../models/BarterRequest');
const Message = require('../models/Message');
const Meetup = require('../models/Meetup');
const Review = require('../models/Review');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(auth);
router.use(adminAuth);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Barter statistics
    const totalBarters = await BarterRequest.countDocuments();
    const activeBarters = await BarterRequest.countDocuments({ status: { $in: ['pending', 'accepted', 'in_progress'] } });
    const completedBarters = await BarterRequest.countDocuments({ status: 'completed' });
    const newBartersThisWeek = await BarterRequest.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Meetup statistics
    const totalMeetups = await Meetup.countDocuments();
    const upcomingMeetups = await Meetup.countDocuments({ 
      scheduledDate: { $gte: new Date() },
      status: 'scheduled'
    });
    const newMeetupsThisWeek = await Meetup.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Message statistics
    const totalMessages = await Message.countDocuments();
    const newMessagesThisWeek = await Message.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Review statistics
    const totalReviews = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $match: { 'moderation.status': 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    // Top universities
    const topUniversities = await User.aggregate([
      { $group: { _id: '$university', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top counties
    const topCounties = await User.aggregate([
      { $group: { _id: '$county', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity
    const recentUsers = await User.find({ createdAt: { $gte: sevenDaysAgo } })
      .select('firstName lastName university county createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentBarters = await BarterRequest.find({ createdAt: { $gte: sevenDaysAgo } })
      .populate('requester', 'firstName lastName')
      .populate('provider', 'firstName lastName')
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        newThisWeek: newUsersThisWeek
      },
      barters: {
        total: totalBarters,
        active: activeBarters,
        completed: completedBarters,
        newThisWeek: newBartersThisWeek
      },
      meetups: {
        total: totalMeetups,
        upcoming: upcomingMeetups,
        newThisWeek: newMeetupsThisWeek
      },
      messages: {
        total: totalMessages,
        newThisWeek: newMessagesThisWeek
      },
      reviews: {
        total: totalReviews,
        averageRating: averageRating[0]?.avgRating || 0
      },
      topUniversities,
      topCounties,
      recentActivity: {
        users: recentUsers,
        barters: recentBarters
      }
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      university,
      county,
      isActive,
      isVerified,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    // Build search criteria
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (university) query.university = { $regex: university, $options: 'i' };
    if (county) query.county = { $regex: county, $options: 'i' };
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'name':
        sortOptions = { firstName: 1, lastName: 1 };
        break;
      case 'rating':
        sortOptions = { 'rating.average': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Admin
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
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

    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user
// @access  Admin
router.put('/users/:id/verify', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      message: 'User verified successfully'
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/barters
// @desc    Get all barter requests for moderation
// @access  Admin
router.get('/barters', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'newest'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'requestedSkill.skill': { $regex: search, $options: 'i' } },
        { 'offeredSkill.skill': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'deadline':
        sortOptions = { deadline: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const barters = await BarterRequest.find(query)
      .populate('requester', 'firstName lastName email university')
      .populate('provider', 'firstName lastName email university')
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

// @route   GET /api/admin/reviews
// @desc    Get reviews for moderation
// @access  Admin
router.get('/reviews', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'pending',
      flagged = false
    } = req.query;

    const query = {};

    if (status) query['moderation.status'] = status;
    if (flagged === 'true') query['moderation.isFlagged'] = true;

    const reviews = await Review.find(query)
      .populate('reviewer', 'firstName lastName email')
      .populate('reviewee', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/reviews/:id/moderate
// @desc    Moderate a review
// @access  Admin
router.put('/reviews/:id/moderate', [
  body('status').isIn(['approved', 'rejected', 'hidden']).withMessage('Invalid status')
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
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.moderation.status = status;
    review.moderation.moderatedBy = req.user.id;
    review.moderation.moderatedAt = new Date();
    await review.save();

    res.json({
      success: true,
      message: `Review ${status} successfully`
    });

  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Admin
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // User growth over time
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Barter success rate
    const barterStats = await BarterRequest.aggregate([
      { $match: { createdAt: { $gte: dateFilter } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Popular skills
    const popularSkills = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Most active users
    const activeUsers = await User.aggregate([
      { $match: { lastActive: { $gte: dateFilter } } },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          university: 1,
          completedBarters: 1,
          activeBarters: 1,
          rating: 1
        }
      },
      { $sort: { completedBarters: -1 } },
      { $limit: 10 }
    ]);

    const analytics = {
      userGrowth,
      barterStats,
      popularSkills,
      activeUsers
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;