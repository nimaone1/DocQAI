const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');

class DocumentService {
  constructor() {
    this.chunkSize = 1000; // Default chunk size
    this.chunkOverlap = 200; // Default overlap
  }

  async extractTextFromFile(filePath, fileType) {
    console.log(`Extracting text from ${fileType} file: ${filePath}`);
    
    try {
      switch (fileType.toLowerCase()) {
        case 'pdf':
          return await this.extractFromPDF(filePath);
        case 'txt':
          return await this.extractFromTXT(filePath);
        case 'docx':
        case 'doc':
          return await this.extractFromDOCX(filePath);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`Error extracting text from ${fileType} file:`, error);
      throw error;
    }
  }

  async extractFromPDF(filePath) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  async extractFromTXT(filePath) {
    return await fs.readFile(filePath, 'utf8');
  }

  async extractFromDOCX(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  splitIntoChunks(text) {
    console.log(`Splitting text into chunks (size: ${this.chunkSize}, overlap: ${this.chunkOverlap})`);
    
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence;

      if (potentialChunk.length <= this.chunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push({
            content: currentChunk + '.',
            chunkIndex: chunkIndex++,
            metadata: {}
          });
        }
        currentChunk = trimmedSentence;
      }
    }

    // Add the last chunk if it exists
    if (currentChunk) {
      chunks.push({
        content: currentChunk + '.',
        chunkIndex: chunkIndex++,
        metadata: {}
      });
    }

    console.log(`Created ${chunks.length} chunks from document`);
    return chunks;
  }

  async processDocument(documentId) {
    console.log(`Starting document processing for ID: ${documentId}`);
    
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Update status to processing
      document.status = 'processing';
      document.processingProgress = 10;
      await document.save();

      // Extract text from file
      const text = await this.extractTextFromFile(document.filePath, document.type);
      document.content = text;
      document.processingProgress = 50;
      await document.save();

      // Split into chunks
      const chunks = this.splitIntoChunks(text);
      document.processingProgress = 80;
      await document.save();

      // Save chunks to database
      const chunkDocuments = chunks.map(chunk => ({
        documentId: document._id,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        metadata: chunk.metadata
      }));

      await DocumentChunk.insertMany(chunkDocuments);

      // Update document status
      document.status = 'processed';
      document.processingProgress = 100;
      document.chunks = chunks.length;
      await document.save();

      console.log(`Document processing completed for ID: ${documentId}`);
      return document;

    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      
      // Update document with error status
      await Document.findByIdAndUpdate(documentId, {
        status: 'error',
        errorMessage: error.message
      });
      
      throw error;
    }
  }

  async deleteDocumentFiles(document) {
    try {
      if (document.filePath && await fs.access(document.filePath).then(() => true).catch(() => false)) {
        await fs.unlink(document.filePath);
        console.log(`Deleted file: ${document.filePath}`);
      }
    } catch (error) {
      console.error(`Error deleting file ${document.filePath}:`, error);
    }
  }
}

module.exports = new DocumentService();