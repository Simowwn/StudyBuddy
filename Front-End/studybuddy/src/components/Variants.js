import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Variants.css';

function Variants() {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [variants, setVariants] = useState(['']);
  const [error, setError] = useState('');

  // Mock data for quizzes
  const quizzes = [
    'Biology Quiz',
    'Chemistry Quiz',
    'Physics Quiz',
    'Math Quiz'
  ];

  const handleQuizChange = (e) => {
    setSelectedQuiz(e.target.value);
    setError('');
  };

  const addVariant = () => {
    setVariants([...variants, '']);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index);
      setVariants(newVariants);
    }
  };

  const handleVariantChange = (index, value) => {
    const newVariants = [...variants];
    newVariants[index] = value;
    setVariants(newVariants);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedQuiz) {
      setError('Please select a quiz');
      return;
    }

    const validVariants = variants.filter(v => v.trim() !== '');
    if (validVariants.length < 2) {
      setError('Please add at least 2 variants');
      return;
    }

    // Here you would typically save the variants
    console.log('Quiz:', selectedQuiz);
    console.log('Variants:', validVariants);
    
    navigate('/items');
  };

  const handleBack = () => {
    navigate('/quiz');
  };

  return (
    <div className="variants-container">
      <div className="variants-header">
        <div className="variants-icon-circle">
          <span className="options-icon">⚙️</span>
        </div>
        <h1>Add Quiz Variants</h1>
        <p>Create multiple choice options for your quiz</p>
      </div>
      
      <div className="variants-form">
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
            <label>Quiz Variants</label>
            <div className="variants-list">
              {variants.map((variant, index) => (
                <div key={index} className="variant-input-group">
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) => handleVariantChange(index, e.target.value)}
                    placeholder={`Variant ${index + 1}...`}
                    required
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="remove-variant-btn"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="add-variant-btn"
            >
              + Add Variant
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="variants-button"
            disabled={!selectedQuiz || variants.filter(v => v.trim() !== '').length < 2}
          >
            Next: Add Items →
          </button>
        </form>
      </div>
    </div>
  );
}

export default Variants;
