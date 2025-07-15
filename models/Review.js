const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Related barter request
  relatedBarter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarterRequest',
    required: true
  },
  
  // Overall rating
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // Detailed ratings
  detailedRatings: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    skillLevel: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    friendliness: {
      type: Number,
      min: 1,
      max: 5
    },
    meetupExperience: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Written review
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters']
  },
  
  // Skills reviewed
  skillsReviewed: [{
    skill: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }],
  
  // Tags for quick categorization
  tags: [{
    type: String,
    enum: [
      'helpful', 'professional', 'patient', 'knowledgeable', 'creative',
      'punctual', 'responsive', 'friendly', 'expert', 'beginner-friendly',
      'great-mentor', 'good-collaborator', 'highly-recommend'
    ]
  }],
  
  // Review type
  type: {
    type: String,
    enum: ['barter', 'meetup', 'general'],
    default: 'barter'
  },
  
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Admin moderation
  moderation: {
    isFlagged: {
      type: Boolean,
      default: false
    },
    flagReason: String,
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      default: 'approved'
    }
  },
  
  // Interaction tracking
  helpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Response from reviewee
  response: {
    content: String,
    respondedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata
  wasBarterSuccessful: {
    type: Boolean,
    required: true
  },
  
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  
  // Language of review
  language: {
    type: String,
    enum: ['English', 'Swahili', 'Mixed'],
    default: 'English'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ relatedBarter: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ 'moderation.status': 1 });
reviewSchema.index({ isVerified: 1 });

// Compound index for preventing duplicate reviews
reviewSchema.index({ reviewer: 1, reviewee: 1, relatedBarter: 1 }, { unique: true });

// Virtual for average detailed rating
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = this.detailedRatings;
  const validRatings = Object.values(ratings).filter(rating => rating && rating > 0);
  
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / validRatings.length) * 10) / 10;
});

// Method to calculate helpfulness score
reviewSchema.methods.calculateHelpfulness = function() {
  const hasComment = this.comment && this.comment.length > 20;
  const hasDetailedRatings = Object.values(this.detailedRatings).some(rating => rating > 0);
  const hasSkillsReviewed = this.skillsReviewed.length > 0;
  
  let score = 0;
  if (hasComment) score += 3;
  if (hasDetailedRatings) score += 2;
  if (hasSkillsReviewed) score += 2;
  if (this.tags.length > 0) score += 1;
  
  return score;
};

// Method to check if review is comprehensive
reviewSchema.methods.isComprehensive = function() {
  return this.calculateHelpfulness() >= 5;
};

// Method to add helpful vote
reviewSchema.methods.addHelpfulVote = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Method to add response
reviewSchema.methods.addResponse = function(content, isPublic = true) {
  this.response = {
    content,
    respondedAt: new Date(),
    isPublic
  };
  return this.save();
};

// Method to flag review
reviewSchema.methods.flagReview = function(reason, moderatorId) {
  this.moderation.isFlagged = true;
  this.moderation.flagReason = reason;
  this.moderation.moderatedBy = moderatorId;
  this.moderation.moderatedAt = new Date();
  this.moderation.status = 'pending';
  return this.save();
};

// Static method to calculate user's average rating
reviewSchema.statics.calculateUserAverageRating = async function(userId) {
  const result = await this.aggregate([
    { $match: { reviewee: mongoose.Types.ObjectId(userId), 'moderation.status': 'approved' } },
    { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, count: 0 };
};

// Static method to get trending reviewers
reviewSchema.statics.getTrendingReviewers = async function(limit = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return await this.aggregate([
    { $match: { createdAt: { $gte: oneWeekAgo } } },
    { $group: { _id: '$reviewer', reviewCount: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
    { $sort: { reviewCount: -1, avgRating: -1 } },
    { $limit: limit },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'reviewer' } },
    { $unwind: '$reviewer' }
  ]);
};

module.exports = mongoose.model('Review', reviewSchema);