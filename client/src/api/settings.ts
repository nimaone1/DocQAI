import api from './api';

// Description: Get current settings
// Endpoint: GET /api/settings
// Request: {}
// Response: { settings: { modelName: string, embeddingModel: string, chunkSize: number, chunkOverlap: number, maxRetrievalResults: number, similarityThreshold: number, responseMaxLength: number, temperature: number, enableStreaming: boolean, enableCaching: boolean, storageLocation: string } }
export const getSettings = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        settings: {
          modelName: "llama2-7b",
          embeddingModel: "sentence-transformers/all-MiniLM-L6-v2",
          chunkSize: 1000,
          chunkOverlap: 200,
          maxRetrievalResults: 5,
          similarityThreshold: 0.7,
          responseMaxLength: 2000,
          temperature: 0.7,
          enableStreaming: true,
          enableCaching: true,
          storageLocation: "/app/data"
        }
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/settings');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Update settings
// Endpoint: PUT /api/settings
// Request: { settings: object }
// Response: { success: boolean, message: string }
export const updateSettings = (settings: any) => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Settings updated successfully"
      });
    }, 1000);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.put('/api/settings', { settings });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}

// Description: Get available models
// Endpoint: GET /api/settings/models
// Request: {}
// Response: { models: Array<{ name: string, size: string, status: string, description: string }> }
export const getAvailableModels = () => {
  // Mocking the response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        models: [
          {
            name: "llama2-7b",
            size: "3.8GB",
            status: "available",
            description: "Llama 2 7B parameter model for general text generation"
          },
          {
            name: "llama2-13b",
            size: "7.3GB",
            status: "not_downloaded",
            description: "Llama 2 13B parameter model with improved performance"
          },
          {
            name: "mistral-7b",
            size: "4.1GB",
            status: "available",
            description: "Mistral 7B model optimized for instruction following"
          },
          {
            name: "sentence-transformers/all-MiniLM-L6-v2",
            size: "90MB",
            status: "available",
            description: "Lightweight sentence embedding model"
          },
          {
            name: "sentence-transformers/all-mpnet-base-v2",
            size: "420MB",
            status: "downloading",
            description: "High-quality sentence embedding model"
          }
        ]
      });
    }, 500);
  });
  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/settings/models');
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message);
  // }
}