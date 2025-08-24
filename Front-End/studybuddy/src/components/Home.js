import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStart = () => {
    navigate('/quiz');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>STUDYBUD</h1>
          </div>
          <button onClick={handleLogout} className="logout-button">
            {/* <span className="logout-icon">🚪</span> */}
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
        
        <div className="cta-section">
          <button onClick={handleStart} className="cta-button">
            <span className="button-icon">🚀</span>
            <span className="button-text">Start Creating Now</span>
            <div className="button-arrow">→</div>
          </button>
          <p className="cta-subtitle"> Start immediately</p>
        </div>
      </main>
    </div>
  );
}

export default Home;
