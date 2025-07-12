const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'txt', 'docx', 'doc', 'rtf']
  },
  size: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['processing', 'processed', 'error'],
    default: 'processing'
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  chunks: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String
  },
  content: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for uploadedAt to match frontend expectations
documentSchema.virtual('uploadedAt').get(function() {
  return this.createdAt;
});

// Ensure virtual fields are serialized
documentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret._id = ret._id.toString();
    delete ret.__v;
    delete ret.id;
    return ret;
  }
});

module.exports = mongoose.model('Document', documentSchema);