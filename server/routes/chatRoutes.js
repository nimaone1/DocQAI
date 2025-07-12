const express = require('express');
const ChatSession = require('../models/ChatSession');
const ChatMessage = require('../models/ChatMessage');
const Document = require('../models/Document');
const chatService = require('../services/chatService');

const router = express.Router();

// GET /api/chat-sessions - Get all chat sessions
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all chat sessions');
    
    const sessions = await ChatSession.find()
      .populate('documents', 'name')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: error.message
    });
  }
});

// POST /api/chat-sessions - Create a new chat session
router.post('/', async (req, res) => {
  try {
    const { name, documentIds } = req.body;

    if (!name || !documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Session name and at least one document ID are required'
      });
    }

    console.log(`Creating new chat session: ${name} with documents: ${documentIds}`);

    // Verify all documents exist
    const documents = await Document.find({ _id: { $in: documentIds } });
    if (documents.length !== documentIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more documents not found'
      });
    }

    const session = new ChatSession({
      name,
      documents: documentIds
    });

    await session.save();
    await session.populate('documents', 'name');

    console.log(`Chat session created with ID: ${session._id}`);

    res.json({
      success: true,
      message: 'Chat session created successfully',
      session: session
    });

  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session',
      error: error.message
    });
  }
});

// DELETE /api/chat-sessions/:id - Delete a chat session
router.delete('/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    console.log(`Deleting chat session: ${sessionId}`);

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Delete all messages in the session
    await ChatMessage.deleteMany({ sessionId: sessionId });
    console.log(`Deleted messages for session: ${sessionId}`);

    // Delete the session
    await ChatSession.findByIdAndDelete(sessionId);
    console.log(`Chat session deleted: ${sessionId}`);

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: error.message
    });
  }
});

// GET /api/chat-sessions/:id/messages - Get messages in a session
router.get('/:id/messages', async (req, res) => {
  try {
    const sessionId = req.params.id;
    console.log(`Fetching messages for session: ${sessionId}`);

    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const messages = await ChatMessage.find({ sessionId: sessionId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages: messages
    });

  } catch (error) {
    console.error('Error fetching session messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session messages',
      error: error.message
    });
  }
});

// POST /api/chat-sessions/:id/messages - Send a message in a session
router.post('/:id/messages', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    console.log(`Sending message to session ${sessionId}: ${question}`);

    const session = await ChatSession.findById(sessionId).populate('documents');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Create user message
    const userMessage = new ChatMessage({
      sessionId: sessionId,
      type: 'user',
      content: question.trim()
    });

    await userMessage.save();

    // Generate AI response
    const documentIds = session.documents.map(doc => doc._id);
    const aiResponse = await chatService.generateResponse(question.trim(), documentIds);

    // Create assistant message
    const assistantMessage = new ChatMessage({
      sessionId: sessionId,
      type: 'assistant',
      content: aiResponse.answer,
      sources: aiResponse.sources,
      responseTime: aiResponse.responseTime
    });

    await assistantMessage.save();

    // Update session with last message info
    session.lastMessage = question.trim();
    session.lastMessageAt = new Date();
    session.messageCount += 2; // User + assistant message
    await session.save();

    console.log(`Messages saved for session: ${sessionId}`);

    res.json({
      success: true,
      userMessage: userMessage,
      assistantMessage: assistantMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

module.exports = router;