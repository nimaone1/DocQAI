import api from './api';

// Description: Get a list of documents
// Endpoint: GET /api/documents
// Request: {}
// Response: { success: boolean, documents: Array<{ _id: string, name: string, type: string, size: number, status: string, uploadedAt: string, processedAt?: string, chunkCount?: number }> }
export const getDocuments = async () => {
  try {
    console.log('Making API call to /api/documents');
    const response = await api.get('/api/documents');
    console.log('API response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API call failed:', error);
    console.error('Error response:', error.response);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Upload a new document
// Endpoint: POST /api/documents/upload
// Request: FormData with file
// Response: { success: boolean, message: string, document: { _id: string, name: string, type: string, size: number, status: string } }
export const uploadDocument = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    
    console.log('Uploading document:', file.name);
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Upload failed:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Delete a document
// Endpoint: DELETE /api/documents/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteDocument = async (documentId: string) => {
  try {
    console.log('Deleting document:', documentId);
    const response = await api.delete(`/api/documents/${documentId}`);
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Delete failed:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get document content
// Endpoint: GET /api/documents/:id/content
// Request: {}
// Response: { success: boolean, content: string, document: { _id: string, name: string, type: string } }
export const getDocumentContent = async (documentId: string) => {
  try {
    console.log('Getting document content:', documentId);
    const response = await api.get(`/api/documents/${documentId}/content`);
    console.log('Content response received');
    return response.data;
  } catch (error: any) {
    console.error('Get content failed:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Get document chunks
// Endpoint: GET /api/documents/:id/chunks
// Request: {}
// Response: { success: boolean, chunks: Array<{ _id: string, content: string, chunkIndex: number, metadata?: object }> }
export const getDocumentChunks = async (documentId: string) => {
  try {
    console.log('Getting document chunks:', documentId);
    const response = await api.get(`/api/documents/${documentId}/chunks`);
    console.log('Chunks response received');
    return response.data;
  } catch (error: any) {
    console.error('Get chunks failed:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
}