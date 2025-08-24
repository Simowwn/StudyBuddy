import apiService from './apiService';
import API_CONFIG from '../config/api';

class QuizService {
  // Get all quizzes for the authenticated user
  async getQuizzes() {
    return apiService.get(API_CONFIG.ENDPOINTS.QUIZZES);
  }

  // Get a specific quiz by ID
  async getQuiz(id) {
    return apiService.get(`${API_CONFIG.ENDPOINTS.QUIZZES}${id}/`);
  }

  // Create a new quiz
  async createQuiz(quizData) {
    return apiService.post(API_CONFIG.ENDPOINTS.QUIZZES, quizData);
  }

  // Update a quiz
  async updateQuiz(id, quizData) {
    return apiService.put(`${API_CONFIG.ENDPOINTS.QUIZZES}${id}/`, quizData);
  }

  // Delete a quiz
  async deleteQuiz(id) {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.QUIZZES}${id}/`);
  }

  // Submit quiz answers
  async submitQuizAnswers(quizId, answers) {
    return apiService.post(`${API_CONFIG.ENDPOINTS.QUIZZES}${quizId}/submit/`, answers);
  }
}

export default new QuizService();
