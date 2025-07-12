const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure virtual fields are serialized
chatSessionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret._id = ret._id.toString();
    delete ret.__v;
    delete ret.id;
    return ret;
  }
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);