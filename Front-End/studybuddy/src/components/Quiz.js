import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import quizService from '../services/quizService';
import './Quiz.css';

function Quiz() {
  const [quizTitle, setQuizTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuizTitle(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!quizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    if (quizTitle.trim().length < 3) {
      setError('Quiz title must be at least 3 characters long');
      return;
    }

    if (quizTitle.trim().length > 100) {
      setError('Quiz title must be less than 100 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create the quiz via API
      const quizData = {
        title: quizTitle.trim()
      };
      
      const createdQuiz = await quizService.createQuiz(quizData);
      console.log('Quiz created successfully:', createdQuiz);
      
      // Navigate to variants page with quiz data
      navigate('/variants', { 
        state: { 
          quizId: createdQuiz.id,
          quizTitle: createdQuiz.title 
        } 
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
      setError(error.message || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isTitleValid = quizTitle.trim().length >= 3 && quizTitle.trim().length <= 100;
  const characterCount = quizTitle.length;

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-icon-circle">
          <span className="book-icon">📚</span>
        </div>
        <h1>Create Your Topic</h1>
        <p>Let's start with a topic that you want to create a quiz on</p>
      </div>
      
      <div className="quiz-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quizTitle">Quiz Title</label>
            <input
              type="text"
              id="quizTitle"
              value={quizTitle}
              onChange={handleInputChange}
              placeholder="e.g., Math Fundamentals, History Quiz, Science Trivia..."
              required
              disabled={loading}
              maxLength={100}
            />
            <div className="input-info">
              <span className={`character-count ${characterCount > 100 ? 'error' : characterCount > 80 ? 'warning' : ''}`}>
                {characterCount}/100 characters
              </span>
              {quizTitle.trim() && (
                <span className={`validation-status ${isTitleValid ? 'valid' : 'invalid'}`}>
                  {isTitleValid ? '✓ Valid title' : '✗ Title too short'}
                </span>
              )}
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="quiz-button"
            disabled={!isTitleValid || loading}
          >
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Quiz;
