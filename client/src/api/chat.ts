import api from './api';

// Description: Create a new chat session
// Endpoint: POST /api/chat-sessions
// Request: { name: string, documentIds: string[] }
// Response: { success: boolean, message: string, session: { _id: string, name: string, documents: Array<{ _id: string, name: string }>, lastMessage: string, lastMessageAt: string, messageCount: number } }
export const createChatSession = async (data: { name: string; documentIds: string[] }) => {
  try {
    const response = await api.post('/api/chat-sessions', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get all chat sessions
// Endpoint: GET /api/chat-sessions
// Request: {}
// Response: { success: boolean, sessions: Array<{ _id: string, name: string, documents: Array<{ _id: string, name: string }>, lastMessage: string, lastMessageAt: string, messageCount: number }> }
export const getChatSessions = async () => {
  try {
    const response = await api.get('/api/chat-sessions');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Delete a chat session
// Endpoint: DELETE /api/chat-sessions/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteChatSession = async (sessionId: string) => {
  try {
    const response = await api.delete(`/api/chat-sessions/${sessionId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get messages in a chat session
// Endpoint: GET /api/chat-sessions/:id/messages
// Request: {}
// Response: { success: boolean, messages: Array<{ _id: string, type: string, content: string, timestamp: string, sources?: Array, responseTime?: number }> }
export const getChatSessionMessages = async (sessionId: string) => {
  try {
    const response = await api.get(`/api/chat-sessions/${sessionId}/messages`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Send a message in a chat session
// Endpoint: POST /api/chat-sessions/:id/messages
// Request: { question: string }
// Response: { success: boolean, userMessage: object, assistantMessage: object }
export const sendMessageToSession = async (sessionId: string, data: { question: string }) => {
  try {
    const response = await api.post(`/api/chat-sessions/${sessionId}/messages`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Legacy functions for backward compatibility (keeping the old mocked implementations for now)

// Description: Send a query to the AI
// Endpoint: POST /api/chat/query
// Request: { question: string }
// Response: { answer: string, sources: Array<{ document: string, page?: number, chunk: string, relevance: number }>, responseTime: number }
export const sendQuery = (data: { question: string }) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        answer: `Based on your documents, here's what I found regarding "${data.question}":\n\nThe information suggests that this topic is covered in multiple sections of your uploaded documents. The key points include comprehensive analysis and detailed explanations that address your specific question.\n\nThe documents provide valuable insights and practical examples that help illustrate the concepts discussed. This information is particularly relevant to understanding the broader context and implications of your inquiry.`,
        sources: [
          {
            document: "AI Research Paper.pdf",
            page: 5,
            chunk: "This section discusses the fundamental principles and applications of artificial intelligence in modern business environments...",
            relevance: 0.92
          },
          {
            document: "Company Handbook.docx",
            page: 12,
            chunk: "Our company policies regarding technology adoption and implementation follow industry best practices...",
            relevance: 0.87
          },
          {
            document: "Technical Documentation.txt",
            chunk: "The technical specifications and requirements outlined in this document provide detailed guidance...",
            relevance: 0.78
          }
        ],
        responseTime: 1250
      });
    }, 2000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.post('/api/chat/query', data);
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get chat history
// Endpoint: GET /api/chat/history
// Request: {}
// Response: { messages: Array<{ _id: string, type: string, content: string, timestamp: string, sources?: Array, responseTime?: number }> }
export const getChatHistory = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: [
          {
            _id: "1",
            type: "user",
            content: "What are the main benefits of using AI in business?",
            timestamp: "2024-01-15T14:30:00Z"
          },
          {
            _id: "2",
            type: "assistant",
            content: "Based on your documents, AI offers several key benefits for businesses including improved efficiency, better decision-making through data analysis, cost reduction through automation, and enhanced customer experiences through personalized services.",
            timestamp: "2024-01-15T14:30:15Z",
            sources: [
              {
                document: "AI Research Paper.pdf",
                page: 3,
                chunk: "AI technologies have shown significant impact on business operations...",
                relevance: 0.95
              }
            ],
            responseTime: 1200
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/chat/history');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}