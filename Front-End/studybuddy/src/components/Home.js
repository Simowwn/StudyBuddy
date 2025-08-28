import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import quizService from '../services/quizService';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Load user's quizzes on component mount
  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const quizzesData = await quizService.getQuizzes();
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStart = () => {
    navigate('/quiz');
  };

  const handleViewQuiz = async (quizId) => {
    try {
      setLoading(true);
      // Navigate to matching page with quiz ID in URL
      navigate(`/matching/${quizId}`);
    } catch (error) {
      console.error('Error navigating to quiz:', error);
      setError('Failed to open quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = async (quizId, quizTitle) => {
    try {
      setLoading(true);
      // Navigate to edit page with quiz ID
      navigate(`/quiz/edit/${quizId}`);
    } catch (error) {
      console.error('Error navigating to edit quiz:', error);
      setError('Failed to open quiz for editing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Mindly.</h1>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2 className="hero-title">
              Create Amazing Quizzes
              <span className="title-accent"> in Minutes</span>
            </h2>
            <p className="hero-description">
              Transform your study sessions with interactive quizzes. 
              Build, customize, and master your learning journey.
            </p>
          </div>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {successMessage}
            <button 
              onClick={() => setSuccessMessage('')} 
              className="close-message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
            <button 
              onClick={() => setError('')} 
              className="close-message"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="cta-section">
          <button onClick={handleStart} className="cta-button">
            <span className="button-icon">🚀</span>
            <span className="button-text">Start Creating Now</span>
            <div className="button-arrow">→</div>
          </button>
          <p className="cta-subtitle"> Start immediately</p>
        </div>

        {/* Existing Quizzes Section */}
        <div className="quizzes-section">
          <h3>Your Quizzes</h3>
          {loading ? (
            <div className="loading-message">Loading your quizzes...</div>
          ) : quizzes.length > 0 ? (
            <div className="quizzes-grid">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card">
                  <div className="quiz-card-header">
                    <h4>{quiz.title}</h4>
                    <span className="quiz-date">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="quiz-card-content">
                    <p>Variants: {quiz.variants?.length || 0}</p>
                    <p>Created by: {quiz.user}</p>
                  </div>
                  <div className="quiz-card-actions">
                    <button 
                      onClick={() => handleViewQuiz(quiz.id)}
                      className="view-quiz-btn"
                    >
                      View Quiz
                    </button>
                    <button 
                      onClick={() => handleEditQuiz(quiz.id, quiz.title)}
                      className="edit-quiz-btn"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-quizzes-message">
              <p>You haven't created any quizzes yet.</p>
              <p>Click "Start Creating Now" to create your first quiz!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;