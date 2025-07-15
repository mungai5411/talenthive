const mongoose = require('mongoose');

const meetupSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'maybe'],
      default: 'invited'
    },
    responseDate: Date
  }],
  
  // Meetup details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Skills/purpose
  skillsInvolved: [{
    skill: String,
    category: {
      type: String,
      enum: ['Academic', 'Technical', 'Creative', 'Language', 'Sports', 'Music', 'Other']
    }
  }],
  
  // Location
  location: {
    county: {
      type: String,
      required: true
    },
    town: {
      type: String,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  
  // Timing
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: [0.5, 'Duration must be at least 0.5 hours'],
    max: [24, 'Duration cannot exceed 24 hours']
  },
  
  // Meetup type
  type: {
    type: String,
    enum: ['study_group', 'skill_exchange', 'workshop', 'networking', 'project_collaboration', 'other'],
    required: true
  },
  
  // Capacity
  maxParticipants: {
    type: Number,
    default: 10,
    min: [2, 'Meetup must allow at least 2 participants'],
    max: [100, 'Meetup cannot exceed 100 participants']
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  
  // Related barter request
  relatedBarter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarterRequest'
  },
  
  // Requirements
  requirements: {
    items: [String], // What participants should bring
    preparation: String, // What participants should prepare
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all_levels']
    }
  },
  
  // Communication
  groupChatId: String,
  announcements: [{
    message: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Completion details
  completionDetails: {
    actualStartTime: Date,
    actualEndTime: Date,
    actualDuration: Number,
    attendees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notes: String,
    photos: [String], // URLs to photos
    achievements: [String] // What was accomplished
  },
  
  // Feedback
  feedback: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Recurrance (for regular meetups)
  recurrence: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    endDate: Date
  },
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'university', 'private'],
    default: 'public'
  },
  
  // Tags for categorization
  tags: [String]
}, {
  timestamps: true
});

// Indexes for efficient querying
meetupSchema.index({ organizer: 1, scheduledDate: 1 });
meetupSchema.index({ 'location.county': 1, 'location.town': 1 });
meetupSchema.index({ scheduledDate: 1, status: 1 });
meetupSchema.index({ type: 1 });
meetupSchema.index({ 'skillsInvolved.skill': 'text', title: 'text', description: 'text' });

// Virtual for current participant count
meetupSchema.virtual('currentParticipants').get(function() {
  return this.participants.filter(p => p.status === 'accepted').length;
});

// Virtual for available spots
meetupSchema.virtual('availableSpots').get(function() {
  return this.maxParticipants - this.currentParticipants;
});

// Method to check if meetup is full
meetupSchema.methods.isFull = function() {
  return this.currentParticipants >= this.maxParticipants;
};

// Method to check if user is organizer
meetupSchema.methods.isOrganizer = function(userId) {
  return this.organizer.toString() === userId.toString();
};

// Method to check if user is participant
meetupSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.user.toString() === userId.toString() && p.status === 'accepted'
  );
};

// Method to add participant
meetupSchema.methods.addParticipant = function(userId, status = 'invited') {
  if (this.isFull()) {
    throw new Error('Meetup is full');
  }
  
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    existingParticipant.status = status;
    existingParticipant.responseDate = new Date();
  } else {
    this.participants.push({
      user: userId,
      status,
      responseDate: new Date()
    });
  }
  
  return this.save();
};

// Method to remove participant
meetupSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => 
    p.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to add announcement
meetupSchema.methods.addAnnouncement = function(message, senderId) {
  this.announcements.push({
    message,
    sentBy: senderId,
    sentAt: new Date()
  });
  return this.save();
};

// Method to check if meetup is happening soon
meetupSchema.methods.isHappeningSoon = function(hours = 24) {
  const hoursInMs = hours * 60 * 60 * 1000;
  const timeDiff = this.scheduledDate - new Date();
  return timeDiff > 0 && timeDiff <= hoursInMs;
};

module.exports = mongoose.model('Meetup', meetupSchema);