import api from './api';

// Description: Get system statistics for dashboard
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { stats: { totalDocuments: number, totalQueries: number, modelStatus: string, storageUsed: number, storageTotal: number } }
export const getSystemStats = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          totalDocuments: 12,
          totalQueries: 45,
          modelStatus: "Ready",
          storageUsed: 2.4,
          storageTotal: 10.0
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/dashboard/stats');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get recent documents for dashboard
// Endpoint: GET /api/dashboard/recent-documents
// Request: {}
// Response: { documents: Array<{ _id: string, name: string, uploadedAt: string, status: string, size: number }> }
export const getRecentDocuments = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        documents: [
          {
            _id: "1",
            name: "AI Research Paper.pdf",
            uploadedAt: "2024-01-15T10:30:00Z",
            status: "processed",
            size: 2048576
          },
          {
            _id: "2",
            name: "Company Handbook.docx",
            uploadedAt: "2024-01-14T15:45:00Z",
            status: "processed",
            size: 1024000
          },
          {
            _id: "3",
            name: "Technical Documentation.txt",
            uploadedAt: "2024-01-13T09:20:00Z",
            status: "processing",
            size: 512000
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/dashboard/recent-documents');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get recent queries for dashboard
// Endpoint: GET /api/dashboard/recent-queries
// Request: {}
// Response: { queries: Array<{ _id: string, question: string, timestamp: string, responseTime: number }> }
export const getRecentQueries = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        queries: [
          {
            _id: "1",
            question: "What are the main benefits of using AI in business?",
            timestamp: "2024-01-15T14:30:00Z",
            responseTime: 1250
          },
          {
            _id: "2",
            question: "How does the company handle remote work policies?",
            timestamp: "2024-01-15T11:15:00Z",
            responseTime: 890
          },
          {
            _id: "3",
            question: "What are the technical requirements for the new system?",
            timestamp: "2024-01-14T16:45:00Z",
            responseTime: 1450
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/dashboard/recent-queries');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}