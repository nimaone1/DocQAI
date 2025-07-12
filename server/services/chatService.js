const DocumentChunk = require('../models/DocumentChunk');
const Document = require('../models/Document');

class ChatService {
  constructor() {
    // Initialize any AI service connections here
  }

  async generateResponse(question, documentIds) {
    const startTime = Date.now();
    
    try {
      console.log(`Generating AI response for question: "${question}" with documents: ${documentIds}`);
      
      // Find relevant document chunks
      const sources = await this.findRelevantSources(question, documentIds);
      
      // Generate AI response based on sources
      const answer = await this.generateAIAnswer(question, sources);
      
      const responseTime = Date.now() - startTime;
      
      console.log(`AI response generated in ${responseTime}ms`);
      
      return {
        answer,
        sources: sources.map(source => ({
          document: source.documentName,
          page: source.page,
          chunk: source.content.substring(0, 200) + '...',
          relevance: source.relevance
        })),
        responseTime
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async findRelevantSources(question, documentIds) {
    try {
      // Get all chunks from the specified documents
      const chunks = await DocumentChunk.find({
        documentId: { $in: documentIds }
      }).populate('documentId', 'name');

      if (chunks.length === 0) {
        console.log('No chunks found for the specified documents');
        return [];
      }

      // Simple relevance scoring based on keyword matching
      // In a real implementation, this would use vector similarity
      const questionWords = question.toLowerCase().split(/\s+/);
      
      const scoredChunks = chunks.map(chunk => {
        const content = chunk.content.toLowerCase();
        let relevance = 0;
        
        questionWords.forEach(word => {
          if (content.includes(word)) {
            relevance += 0.1;
          }
        });
        
        // Add some randomness to simulate vector similarity
        relevance += Math.random() * 0.3;
        relevance = Math.min(relevance, 1.0);
        
        return {
          ...chunk.toObject(),
          documentName: chunk.documentId.name,
          relevance
        };
      });

      // Sort by relevance and return top 3
      return scoredChunks
        .filter(chunk => chunk.relevance > 0.2)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 3);
        
    } catch (error) {
      console.error('Error finding relevant sources:', error);
      return [];
    }
  }

  async generateAIAnswer(question, sources) {
    // Simulate AI response generation
    // In a real implementation, this would call an LLM API
    
    if (sources.length === 0) {
      return "I couldn't find relevant information in your documents to answer this question. Please make sure your documents contain information related to your query.";
    }

    const contextText = sources.map(source => source.content).join('\n\n');
    
    // Generate a contextual response based on the sources
    const response = `Based on your uploaded documents, here's what I found regarding "${question}":\n\n` +
      `The information from your documents indicates that this topic is covered across ${sources.length} relevant sections. ` +
      `The key insights from your documents suggest comprehensive coverage of the subject matter.\n\n` +
      `The documents provide detailed explanations and practical examples that directly address your question. ` +
      `This information appears to be particularly relevant based on the content analysis of your uploaded materials.\n\n` +
      `The sources show strong relevance to your inquiry, with relevance scores ranging from ` +
      `${Math.round(Math.min(...sources.map(s => s.relevance)) * 100)}% to ${Math.round(Math.max(...sources.map(s => s.relevance)) * 100)}%.`;

    return response;
  }
}

module.exports = new ChatService();