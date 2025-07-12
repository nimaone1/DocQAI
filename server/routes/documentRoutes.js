const express = require('express');
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const DocumentService = require('../services/documentService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'document-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Add logging middleware for all document routes
router.use((req, res, next) => {
  console.log(`Document route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// GET /api/documents - Get all documents
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all documents from database');

    const documents = await Document.find().sort({ createdAt: -1 });
    
    console.log(`Found ${documents.length} documents`);

    res.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

// POST /api/documents/upload - Upload a new document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log(`Uploading document: ${req.file.originalname}`);

    const document = new Document({
      name: req.file.originalname,
      type: path.extname(req.file.originalname).toLowerCase(),
      size: req.file.size,
      path: req.file.path,
      status: 'uploaded'
    });

    await document.save();
    console.log(`Document saved with ID: ${document._id}`);

    // Process document in background
    DocumentService.processDocument(document._id)
      .then(() => {
        console.log(`Document processing completed for ID: ${document._id}`);
      })
      .catch(error => {
        console.error(`Document processing failed for ID: ${document._id}:`, error);
      });

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: document
    });

  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    console.log(`Deleting document: ${documentId}`);

    const document = await Document.findById(documentId);
    if (!document) {
      console.log(`Document not found: ${documentId}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete document chunks
    await DocumentChunk.deleteMany({ documentId: documentId });
    console.log(`Deleted chunks for document: ${documentId}`);

    // Delete document file
    const fs = require('fs');
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
      console.log(`Deleted file: ${document.path}`);
    }

    // Delete document record
    await Document.findByIdAndDelete(documentId);
    console.log(`Document deleted: ${documentId}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// GET /api/documents/:id/content - Get document content
router.get('/:id/content', async (req, res) => {
  try {
    const documentId = req.params.id;
    console.log(`Getting content for document: ${documentId}`);

    const document = await Document.findById(documentId);
    if (!document) {
      console.log(`Document not found: ${documentId}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const fs = require('fs');
    if (!fs.existsSync(document.path)) {
      console.log(`Document file not found: ${document.path}`);
      return res.status(404).json({
        success: false,
        message: 'Document file not found'
      });
    }

    const content = fs.readFileSync(document.path, 'utf8');
    console.log(`Retrieved content for document: ${documentId} (${content.length} characters)`);

    res.json({
      success: true,
      content: content,
      document: {
        _id: document._id,
        name: document.name,
        type: document.type
      }
    });

  } catch (error) {
    console.error('Error getting document content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document content',
      error: error.message
    });
  }
});

// GET /api/documents/:id/chunks - Get document chunks
router.get('/:id/chunks', async (req, res) => {
  try {
    const documentId = req.params.id;
    console.log(`Getting chunks for document: ${documentId}`);

    const document = await Document.findById(documentId);
    if (!document) {
      console.log(`Document not found: ${documentId}`);
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const chunks = await DocumentChunk.find({ documentId: documentId })
      .sort({ chunkIndex: 1 });

    console.log(`Found ${chunks.length} chunks for document: ${documentId}`);

    res.json({
      success: true,
      chunks: chunks
    });

  } catch (error) {
    console.error('Error getting document chunks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get document chunks',
      error: error.message
    });
  }
});

module.exports = router;