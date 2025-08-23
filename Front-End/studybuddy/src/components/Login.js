import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Here you would typically make an API call to authenticate the user
    console.log('Logging in user:', formData.username);
    
    // For demo purposes, redirect to home
    navigate('/home');
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-form-container">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="auth-button">
              Login
            </button>
          </form>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
      
      <div className="auth-right">
        <div className="auth-welcome">
          <h1>Study Buddy</h1>
          <p>Your personal learning companion</p>
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span>Create Custom Quizzes</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Track Your Progress</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚀</span>
              <span>Study Smarter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
