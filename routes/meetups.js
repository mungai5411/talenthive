const express = require('express');
const { body, validationResult } = require('express-validator');
const Meetup = require('../models/Meetup');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/meetups/create
// @desc    Create a new meetup
// @access  Private
router.post('/create', auth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').notEmpty().withMessage('Meetup type is required'),
  body('location.county').trim().notEmpty().withMessage('County is required'),
  body('location.town').trim().notEmpty().withMessage('Town is required'),
  body('location.venue').trim().notEmpty().withMessage('Venue is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('maxParticipants').optional().isInt({ min: 2, max: 100 }).withMessage('Max participants must be between 2 and 100')
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
      description,
      type,
      location,
      scheduledDate,
      duration,
      maxParticipants = 10,
      skillsInvolved,
      requirements,
      visibility = 'public',
      tags,
      relatedBarter
    } = req.body;

    // Create meetup
    const meetup = new Meetup({
      organizer: req.user.id,
      title,
      description,
      type,
      location,
      scheduledDate: new Date(scheduledDate),
      duration,
      maxParticipants,
      skillsInvolved: skillsInvolved || [],
      requirements: requirements || {},
      visibility,
      tags: tags || [],
      relatedBarter
    });

    await meetup.save();

    // Populate the response
    const populatedMeetup = await Meetup.findById(meetup._id)
      .populate('organizer', 'firstName lastName avatar university');

    res.status(201).json({
      success: true,
      message: 'Meetup created successfully',
      data: { meetup: populatedMeetup }
    });

  } catch (error) {
    console.error('Create meetup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meetups
// @desc    Get meetups (with filtering)
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      county,
      town,
      type,
      skill,
      status = 'scheduled',
      page = 1,
      limit = 20,
      sortBy = 'date'
    } = req.query;

    const query = { status };

    // Build search criteria
    if (county) query['location.county'] = { $regex: county, $options: 'i' };
    if (town) query['location.town'] = { $regex: town, $options: 'i' };
    if (type) query.type = type;
    if (skill) query['skillsInvolved.skill'] = { $regex: skill, $options: 'i' };

    // Filter by visibility
    if (req.user) {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'university', 'organizer': req.user.id },
        { visibility: 'private', 'organizer': req.user.id }
      ];
    } else {
      query.visibility = 'public';
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'date':
        sortOptions = { scheduledDate: 1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { 'participants.length': -1 };
        break;
      default:
        sortOptions = { scheduledDate: 1 };
    }

    const meetups = await Meetup.find(query)
      .populate('organizer', 'firstName lastName avatar university')
      .populate('participants.user', 'firstName lastName avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Meetup.countDocuments(query);

    res.json({
      success: true,
      data: {
        meetups,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get meetups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meetups/:id
// @desc    Get single meetup
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id)
      .populate('organizer', 'firstName lastName avatar university phone whatsapp')
      .populate('participants.user', 'firstName lastName avatar university')
      .populate('feedback.user', 'firstName lastName avatar');

    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    res.json({
      success: true,
      data: { meetup }
    });

  } catch (error) {
    console.error('Get meetup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/meetups/:id/join
// @desc    Join a meetup
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Check if meetup is full
    if (meetup.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Meetup is full'
      });
    }

    // Check if user is already a participant
    if (meetup.isParticipant(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant'
      });
    }

    await meetup.addParticipant(req.user.id, 'accepted');

    res.json({
      success: true,
      message: 'Successfully joined meetup'
    });

  } catch (error) {
    console.error('Join meetup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/meetups/:id/leave
// @desc    Leave a meetup
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Check if user is a participant
    if (!meetup.isParticipant(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this meetup'
      });
    }

    await meetup.removeParticipant(req.user.id);

    res.json({
      success: true,
      message: 'Successfully left meetup'
    });

  } catch (error) {
    console.error('Leave meetup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/meetups/:id/announce
// @desc    Add announcement to meetup
// @access  Private
router.post('/:id/announce', auth, [
  body('message').trim().notEmpty().withMessage('Announcement message is required')
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
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Check if user is the organizer
    if (!meetup.isOrganizer(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can make announcements'
      });
    }

    await meetup.addAnnouncement(message, req.user.id);

    res.json({
      success: true,
      message: 'Announcement added successfully'
    });

  } catch (error) {
    console.error('Add announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meetups/my/organized
// @desc    Get meetups organized by user
// @access  Private
router.get('/my/organized', auth, async (req, res) => {
  try {
    const meetups = await Meetup.find({ organizer: req.user.id })
      .populate('participants.user', 'firstName lastName avatar')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: { meetups }
    });

  } catch (error) {
    console.error('Get organized meetups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meetups/my/joined
// @desc    Get meetups joined by user
// @access  Private
router.get('/my/joined', auth, async (req, res) => {
  try {
    const meetups = await Meetup.find({
      'participants.user': req.user.id,
      'participants.status': 'accepted'
    })
    .populate('organizer', 'firstName lastName avatar university')
    .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: { meetups }
    });

  } catch (error) {
    console.error('Get joined meetups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/meetups/nearby
// @desc    Get nearby meetups
// @access  Private
router.get('/nearby', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    const nearbyMeetups = await Meetup.find({
      'location.county': currentUser.county,
      status: 'scheduled',
      visibility: { $in: ['public', 'university'] },
      scheduledDate: { $gte: new Date() }
    })
    .populate('organizer', 'firstName lastName avatar university')
    .sort({ scheduledDate: 1 })
    .limit(10);

    res.json({
      success: true,
      data: { meetups: nearbyMeetups }
    });

  } catch (error) {
    console.error('Get nearby meetups error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/meetups/:id/status
// @desc    Update meetup status
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
    const meetup = await Meetup.findById(req.params.id);

    if (!meetup) {
      return res.status(404).json({
        success: false,
        message: 'Meetup not found'
      });
    }

    // Check if user is the organizer
    if (!meetup.isOrganizer(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Only organizers can update meetup status'
      });
    }

    meetup.status = status;
    await meetup.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { meetup }
    });

  } catch (error) {
    console.error('Update meetup status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;