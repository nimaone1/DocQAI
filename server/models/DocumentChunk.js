const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  metadata: {
    page: {
      type: Number
    },
    section: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Ensure virtual fields are serialized
documentChunkSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret._id = ret._id.toString();
    delete ret.__v;
    delete ret.id;
    return ret;
  }
});

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);