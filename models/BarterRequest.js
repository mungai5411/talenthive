const mongoose = require('mongoose');

const barterRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // What the requester wants
  requestedSkill: {
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
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    urgency: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Urgent']
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: [0.5, 'Estimated hours must be at least 0.5'],
      max: [100, 'Estimated hours cannot exceed 100']
    }
  },
  
  // What the requester offers in return
  offeredSkill: {
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
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    level: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: [0.5, 'Estimated hours must be at least 0.5'],
      max: [100, 'Estimated hours cannot exceed 100']
    }
  },
  
  // Barter details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  
  // Meeting preferences
  meetingPreference: {
    type: String,
    enum: ['online', 'in_person', 'both'],
    required: true
  },
  
  location: {
    county: String,
    town: String,
    specificLocation: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Timeline
  deadline: {
    type: Date,
    required: true
  },
  
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Progress tracking
  progress: {
    requesterTasks: [{
      task: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    providerTasks: [{
      task: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Completion details
  completionDetails: {
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    requesterSatisfied: Boolean,
    providerSatisfied: Boolean,
    notes: String
  },
  
  // Reviews (populated after completion)
  reviews: {
    requesterReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    providerReview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  },
  
  // Dispute handling
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    disputeReason: String,
    disputeDate: Date,
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  
  // Metadata
  tags: [String],
  priority: {
    type: Number,
    default: 0
  },
  
  // Future monetization fields
  monetization: {
    isMonetized: {
      type: Boolean,
      default: false
    },
    amount: Number,
    currency: {
      type: String,
      enum: ['KES', 'USD'],
      default: 'KES'
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'paypal', 'paybill']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded']
    },
    transactionId: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
barterRequestSchema.index({ requester: 1, status: 1 });
barterRequestSchema.index({ provider: 1, status: 1 });
barterRequestSchema.index({ 'requestedSkill.skill': 'text', 'offeredSkill.skill': 'text', title: 'text' });
barterRequestSchema.index({ deadline: 1 });
barterRequestSchema.index({ createdAt: -1 });
barterRequestSchema.index({ 'requestedSkill.category': 1 });

// Virtual for time remaining
barterRequestSchema.virtual('timeRemaining').get(function() {
  return this.deadline - new Date();
});

// Method to check if barter is overdue
barterRequestSchema.methods.isOverdue = function() {
  return new Date() > this.deadline && this.status === 'in_progress';
};

// Method to calculate completion percentage
barterRequestSchema.methods.calculateProgress = function() {
  const requesterCompleted = this.progress.requesterTasks.filter(task => task.completed).length;
  const providerCompleted = this.progress.providerTasks.filter(task => task.completed).length;
  const totalTasks = this.progress.requesterTasks.length + this.progress.providerTasks.length;
  
  if (totalTasks === 0) return 0;
  
  return Math.round(((requesterCompleted + providerCompleted) / totalTasks) * 100);
};

// Method to add a message
barterRequestSchema.methods.addMessage = function(senderId, messageText) {
  this.messages.push({
    sender: senderId,
    message: messageText,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status
barterRequestSchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  
  if (newStatus === 'completed') {
    this.completionDetails.completedBy = userId;
    this.completionDetails.completedAt = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('BarterRequest', barterRequestSchema);