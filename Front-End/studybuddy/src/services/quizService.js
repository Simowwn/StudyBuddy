import apiService from './apiService';
import API_CONFIG from '../config/api';

class QuizService {
  // ===== QUIZ METHODS =====
  
  // Get all quizzes for the authenticated user
  async getQuizzes() {
    return apiService.get(API_CONFIG.ENDPOINTS.QUIZZES);
  }

  // Get a specific quiz by ID
  async getQuiz(id) {
    try {
      return await apiService.get(`${API_CONFIG.ENDPOINTS.QUIZZES}${id}/`);
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return null; // Return null if quiz not found
      }
      throw error; // Re-throw other errors
    }
  }

  // Create a new quiz
  async createQuiz(quizData) {
    console.log('Creating quiz with data:', quizData);
    try {
      const result = await apiService.post(API_CONFIG.ENDPOINTS.QUIZZES, quizData);
      console.log('Quiz created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  // Update a quiz
  async updateQuiz(id, quizData) {
    return apiService.put(`${API_CONFIG.ENDPOINTS.QUIZZES}${id}/`, quizData);
  }

  // Delete a quiz
  async deleteQuiz(id) {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.QUIZZES}${id}/`);
  }

  // ===== VARIANT METHODS =====
  
  // Get all variants
  async getVariants() {
    return apiService.get(API_CONFIG.ENDPOINTS.VARIANTS);
  }

  // Get variants for a specific quiz
  async getVariantsByQuiz(quizId) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.VARIANTS}?quiz=${quizId}`);
  }

  // Get a specific variant by ID
  async getVariant(id) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.VARIANTS}${id}/`);
  }

  // Create a new variant
  async createVariant(variantData) {
    console.log('Creating variant with data:', variantData);
    try {
      const result = await apiService.post(API_CONFIG.ENDPOINTS.VARIANTS, variantData);
      console.log('Variant created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating variant:', error);
      throw error;
    }
  }

  // Update a variant
  async updateVariant(id, variantData) {
    return apiService.put(`${API_CONFIG.ENDPOINTS.VARIANTS}${id}/`, variantData);
  }

  // Delete a variant
  async deleteVariant(id) {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.VARIANTS}${id}/`);
  }

  // ===== ITEM METHODS =====
  
  // Get all items
  async getItems() {
    return apiService.get(API_CONFIG.ENDPOINTS.ITEMS);
  }

  // Get items for a specific variant
  async getItemsByVariant(variantId) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ITEMS}?variant=${variantId}`);
  }

  // Get a specific item by ID
  async getItem(id) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ITEMS}${id}/`);
  }

  // Create a new item
  async createItem(itemData) {
    console.log('Creating item with data:', itemData);
    try {
      const result = await apiService.post(API_CONFIG.ENDPOINTS.ITEMS, itemData);
      console.log('Item(s) created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  // Update an item
  async updateItem(id, itemData) {
    return apiService.put(`${API_CONFIG.ENDPOINTS.ITEMS}${id}/`, itemData);
  }

  // Delete an item
  async deleteItem(id) {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.ITEMS}${id}/`);
  }

  // ===== COMPOSITE METHODS =====
  
  // Get a complete quiz with all variants and items
  async getCompleteQuiz(quizId) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.QUIZZES}${quizId}/`);
  }

  // Create a quiz with variants and items in one call
  async createCompleteQuiz(quizData) {
    const quiz = await this.createQuiz(quizData);
    
    if (quizData.variants && Array.isArray(quizData.variants)) {
      for (const variantData of quizData.variants) {
        variantData.quiz = quiz.id;
        const variant = await this.createVariant(variantData);
        
        if (variantData.items && Array.isArray(variantData.items)) {
          for (const itemData of variantData.items) {
            itemData.variant = variant.id;
            await this.createItem(itemData);
          }
        }
      }
    }
    
    return this.getCompleteQuiz(quiz.id);
  }
}

export default new QuizService();