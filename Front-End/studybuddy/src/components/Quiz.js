import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Quiz.css';

function Quiz() {
  const [quizTitle, setQuizTitle] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!quizTitle.trim()) {
      setError('Please enter a quiz title');
      return;
    }

    // Here you would typically save the quiz title to your backend
    console.log('Creating quiz:', quizTitle);
    
    // For demo purposes, redirect to variants
    navigate('/variants');
  };

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
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter your quiz title..."
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="quiz-button"
            disabled={!quizTitle.trim()}
          >
            Create Quiz
          </button>
        </form>
      </div>
    </div>
  );
}

export default Quiz;
