const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true
  },
  type: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sources: [{
    document: {
      type: String,
      required: true
    },
    page: {
      type: Number
    },
    chunk: {
      type: String,
      required: true
    },
    relevance: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    }
  }],
  responseTime: {
    type: Number
  }
}, {
  timestamps: true
});

// Ensure virtual fields are serialized
chatMessageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret._id = ret._id.toString();
    ret.timestamp = ret.createdAt;
    delete ret.__v;
    delete ret.id;
    return ret;
  }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);