import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Items.css';

function Items() {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [items, setItems] = useState('');
  const [error, setError] = useState('');

  // Mock data for quizzes and variants
  const quizzes = [
    'Biology Quiz',
    'Chemistry Quiz',
    'Physics Quiz',
    'Math Quiz'
  ];

  const variants = [
    'Option A',
    'Option B', 
    'Option C',
    'Option D'
  ];

  const handleQuizChange = (e) => {
    setSelectedQuiz(e.target.value);
    setSelectedVariant('');
    setError('');
  };

  const handleVariantChange = (e) => {
    setSelectedVariant(e.target.value);
    setError('');
  };

  const handleItemsChange = (e) => {
    setItems(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedQuiz) {
      setError('Please select a quiz');
      return;
    }

    if (!selectedVariant) {
      setError('Please select a variant');
      return;
    }

    if (!items.trim()) {
      setError('Please enter quiz items');
      return;
    }

    // Here you would typically save the items
    console.log('Quiz:', selectedQuiz);
    console.log('Variant:', selectedVariant);
    console.log('Items:', items);
    
    // Navigate to home or success page
    navigate('/home');
  };

  const handleBack = () => {
    navigate('/variants');
  };

  return (
    <div className="items-container">
      <div className="items-header">
        <div className="items-icon-circle">
          <span className="list-icon">📝</span>
        </div>
        <h1>Add Quiz Items</h1>
        <p>Create the actual questions and answers for your quiz</p>
      </div>
      
      <div className="items-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="quizSelect">Select Quiz</label>
            <select
              id="quizSelect"
              value={selectedQuiz}
              onChange={handleQuizChange}
              required
            >
              <option value="">Choose a quiz...</option>
              {quizzes.map((quiz, index) => (
                <option key={index} value={quiz}>{quiz}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="variantSelect">Select Variant</label>
            <select
              id="variantSelect"
              value={selectedVariant}
              onChange={handleVariantChange}
              required
              disabled={!selectedQuiz}
            >
              <option value="">Choose a variant...</option>
              {variants.map((variant, index) => (
                <option key={index} value={variant}>{variant}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="itemsInput">Quiz Items</label>
            <textarea
              id="itemsInput"
              value={items}
              onChange={handleItemsChange}
              placeholder="Enter your quiz items separated by commas (e.g., Question 1, Question 2, Question 3...)"
              rows="6"
              required
            />
            <p className="form-hint">
              Enter each quiz item separated by commas. You can add as many items as you need.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="items-button"
            disabled={!selectedQuiz || !selectedVariant || !items.trim()}
          >
            Create Quiz →
          </button>
        </form>
      </div>
    </div>
  );
}

export default Items;
