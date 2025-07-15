const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Profile Info
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  // University Info
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course/Major is required'],
    trim: true
  },
  yearOfStudy: {
    type: Number,
    required: [true, 'Year of study is required'],
    min: [1, 'Year of study must be at least 1'],
    max: [7, 'Year of study cannot exceed 7']
  },
  graduationYear: {
    type: Number,
    required: [true, 'Expected graduation year is required']
  },
  
  // Location Info
  county: {
    type: String,
    required: [true, 'County is required'],
    trim: true
  },
  town: {
    type: String,
    required: [true, 'Town/City is required'],
    trim: true
  },
  campus: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Skills
  skillsOffered: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Academic', 'Technical', 'Creative', 'Language', 'Sports', 'Music', 'Other']
    },
    level: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    description: {
      type: String,
      maxlength: [200, 'Skill description cannot exceed 200 characters']
    }
  }],
  
  skillsNeeded: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Academic', 'Technical', 'Creative', 'Language', 'Sports', 'Music', 'Other']
    },
    urgency: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Urgent']
    },
    description: {
      type: String,
      maxlength: [200, 'Skill description cannot exceed 200 characters']
    }
  }],
  
  // Contact Info
  phone: {
    type: String,
    trim: true,
    match: [/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number']
  },
  whatsapp: {
    type: String,
    trim: true,
    match: [/^(\+254|0)[17]\d{8}$/, 'Please enter a valid WhatsApp number']
  },
  telegram: {
    type: String,
    trim: true
  },
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Activity Stats
  completedBarters: {
    type: Number,
    default: 0
  },
  activeBarters: {
    type: Number,
    default: 0
  },
  
  // Preferences
  preferences: {
    availableForMeetups: {
      type: Boolean,
      default: true
    },
    maxDistance: {
      type: Number,
      default: 50, // kilometers
      min: 1,
      max: 200
    },
    preferredMeetingTimes: [{
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Weekend']
    }],
    languages: [{
      type: String,
      enum: ['English', 'Swahili', 'Kikuyu', 'Luo', 'Luhya', 'Kamba', 'Kalenjin', 'Kisii', 'Meru', 'Other']
    }]
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  
  // Timestamps
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Admin fields
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for efficient searching
userSchema.index({ email: 1 });
userSchema.index({ university: 1, county: 1 });
userSchema.index({ 'skillsOffered.skill': 'text', 'skillsNeeded.skill': 'text' });
userSchema.index({ isActive: 1, isVerified: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Method to calculate compatibility score with another user
userSchema.methods.calculateCompatibility = function(otherUser) {
  let score = 0;
  
  // Same university bonus
  if (this.university === otherUser.university) score += 20;
  
  // Same county bonus
  if (this.county === otherUser.county) score += 15;
  
  // Skill matching
  const myOfferedSkills = this.skillsOffered.map(s => s.skill.toLowerCase());
  const otherNeededSkills = otherUser.skillsNeeded.map(s => s.skill.toLowerCase());
  
  const matchingSkills = myOfferedSkills.filter(skill => 
    otherNeededSkills.includes(skill)
  );
  
  score += matchingSkills.length * 10;
  
  // Rating bonus
  if (this.rating.average > 4) score += 10;
  
  return Math.min(score, 100);
};

module.exports = mongoose.model('User', userSchema);