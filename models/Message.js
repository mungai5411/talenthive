const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Message content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Message type
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  
  // File attachment (if any)
  attachment: {
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  },
  
  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Timestamps
  readAt: Date,
  
  // Related barter request (if message is part of a barter discussion)
  relatedBarter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BarterRequest'
  },
  
  // Message thread/conversation ID
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  
  // Priority (for system messages)
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  
  // Metadata
  metadata: {
    edited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    originalContent: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: 1 });
messageSchema.index({ createdAt: -1 });

// Static method to generate conversation ID
messageSchema.statics.generateConversationId = function(userId1, userId2) {
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  this.metadata.originalContent = this.content;
  this.content = newContent;
  this.metadata.edited = true;
  this.metadata.editedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);