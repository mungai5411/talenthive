const express = require('express');
const User = require('../models/User');
const BarterRequest = require('../models/BarterRequest');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/skills/categories
// @desc    Get all skill categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        name: 'Academic',
        icon: '📚',
        description: 'Study help, tutoring, research assistance',
        examples: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Economics']
      },
      {
        name: 'Technical',
        icon: '💻',
        description: 'Programming, web development, IT support',
        examples: ['Web Development', 'Mobile Apps', 'Data Analysis', 'Cybersecurity', 'AI/ML', 'Database Management']
      },
      {
        name: 'Creative',
        icon: '🎨',
        description: 'Design, art, content creation',
        examples: ['Graphic Design', 'Photography', 'Video Editing', 'Writing', 'UI/UX Design', 'Animation']
      },
      {
        name: 'Language',
        icon: '🗣️',
        description: 'Language learning and translation',
        examples: ['English', 'Swahili', 'French', 'Spanish', 'Translation', 'Language Tutoring']
      },
      {
        name: 'Sports',
        icon: '⚽',
        description: 'Sports training and coaching',
        examples: ['Football', 'Basketball', 'Athletics', 'Swimming', 'Volleyball', 'Fitness Training']
      },
      {
        name: 'Music',
        icon: '🎵',
        description: 'Music lessons and performance',
        examples: ['Piano', 'Guitar', 'Vocals', 'Music Production', 'Music Theory', 'Traditional Music']
      },
      {
        name: 'Other',
        icon: '🔧',
        description: 'Various other skills and services',
        examples: ['Cooking', 'Entrepreneurship', 'Public Speaking', 'Event Planning', 'Repair Services']
      }
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/skills/popular
// @desc    Get popular skills
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;

    // Aggregate skills from users
    const pipeline = [
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.skill', count: { $sum: 1 }, category: { $first: '$skillsOffered.category' } } }
    ];

    if (category) {
      pipeline.unshift({ $match: { 'skillsOffered.category': category } });
    }

    pipeline.push(
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    );

    const popularSkills = await User.aggregate(pipeline);

    res.json({
      success: true,
      data: { skills: popularSkills }
    });

  } catch (error) {
    console.error('Get popular skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/skills/trending
// @desc    Get trending skills based on recent barter requests
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Get trending skills from recent barter requests
    const trendingSkills = await BarterRequest.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { 
        _id: '$requestedSkill.skill', 
        count: { $sum: 1 },
        category: { $first: '$requestedSkill.category' }
      }},
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      data: { skills: trendingSkills }
    });

  } catch (error) {
    console.error('Get trending skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/skills/search
// @desc    Search skills
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, category, type = 'offered' } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchField = type === 'offered' ? 'skillsOffered' : 'skillsNeeded';
    const matchQuery = { isActive: true };

    // Build search criteria
    matchQuery[`${searchField}.skill`] = { $regex: query, $options: 'i' };

    if (category) {
      matchQuery[`${searchField}.category`] = category;
    }

    const skills = await User.aggregate([
      { $match: matchQuery },
      { $unwind: `$${searchField}` },
      { $match: { [`${searchField}.skill`]: { $regex: query, $options: 'i' } } },
      { $group: { 
        _id: `$${searchField}.skill`, 
        count: { $sum: 1 },
        category: { $first: `$${searchField}.category` },
        users: { $push: {
          id: '$_id',
          firstName: '$firstName',
          lastName: '$lastName',
          avatar: '$avatar',
          university: '$university',
          rating: '$rating'
        }}
      }},
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: { skills }
    });

  } catch (error) {
    console.error('Search skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/skills/recommendations
// @desc    Get skill recommendations based on user's university and location
// @access  Private
router.get('/recommendations', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const currentUser = await User.findById(req.user.id);
    
    // Get skills that are popular in user's university
    const universitySkills = await User.aggregate([
      { $match: { university: currentUser.university, isActive: true } },
      { $unwind: '$skillsOffered' },
      { $group: { 
        _id: '$skillsOffered.skill', 
        count: { $sum: 1 },
        category: { $first: '$skillsOffered.category' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get skills that are popular in user's county
    const countySkills = await User.aggregate([
      { $match: { county: currentUser.county, isActive: true } },
      { $unwind: '$skillsOffered' },
      { $group: { 
        _id: '$skillsOffered.skill', 
        count: { $sum: 1 },
        category: { $first: '$skillsOffered.category' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get skills that complement user's current skills
    const userSkillCategories = currentUser.skillsOffered.map(skill => skill.category);
    const complementarySkills = await User.aggregate([
      { $match: { 
        isActive: true,
        'skillsOffered.category': { $nin: userSkillCategories }
      }},
      { $unwind: '$skillsOffered' },
      { $match: { 'skillsOffered.category': { $nin: userSkillCategories } } },
      { $group: { 
        _id: '$skillsOffered.skill', 
        count: { $sum: 1 },
        category: { $first: '$skillsOffered.category' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        universitySkills,
        countySkills,
        complementarySkills
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/skills/stats
// @desc    Get skill statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    // Get total skills offered
    const totalSkillsOffered = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    // Get total skills needed
    const totalSkillsNeeded = await User.aggregate([
      { $unwind: '$skillsNeeded' },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    // Get skills by category
    const skillsByCategory = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { 
        _id: '$skillsOffered.category', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1 } }
    ]);

    // Get top universities by skill diversity
    const topUniversities = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { 
        _id: '$university', 
        uniqueSkills: { $addToSet: '$skillsOffered.skill' },
        totalUsers: { $addToSet: '$_id' }
      }},
      { $project: {
        university: '$_id',
        skillCount: { $size: '$uniqueSkills' },
        userCount: { $size: '$totalUsers' }
      }},
      { $sort: { skillCount: -1 } },
      { $limit: 10 }
    ]);

    const stats = {
      totalSkillsOffered: totalSkillsOffered[0]?.count || 0,
      totalSkillsNeeded: totalSkillsNeeded[0]?.count || 0,
      skillsByCategory,
      topUniversities
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