import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import quizService from '../services/quizService';
import './Variants.css';

function Variants() {
  const navigate = useNavigate();
  const location = useLocation();
  const [variants, setVariants] = useState(['']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Get quiz data from navigation state
  const quizId = location.state?.quizId;
  const quizTitle = location.state?.quizTitle || 'Untitled Quiz';

  // Check if we have valid data and redirect if needed
  useEffect(() => {
    if (!quizId) {
      setIsValid(false);
      navigate('/quiz');
    }
  }, [quizId, navigate]);

  // Don't render if data is invalid
  if (!isValid) {
    return null;
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validVariants = variants.filter(v => v.trim() !== '');
    if (validVariants.length < 2) {
      setError('Please add at least 2 variants');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create variants via API
      const createdVariants = [];
      
      for (const variantName of validVariants) {
        const variantData = {
          name: variantName.trim(),
          quiz: quizId
        };
        
        const createdVariant = await quizService.createVariant(variantData);
        createdVariants.push(createdVariant);
      }
      
      console.log('Variants created successfully:', createdVariants);
      
      // Navigate to items page with quiz and variants data
      navigate('/items', { 
        state: { 
          quizId: quizId,
          quizTitle: quizTitle, 
          variants: createdVariants 
        } 
      });
    } catch (error) {
      console.error('Error creating variants:', error);
      setError(error.message || 'Failed to create variants. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <label>Quiz Title</label>
            <div className="quiz-title-display">
              <h3>{quizTitle}</h3>
            </div>
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
                    disabled={loading}
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="remove-variant-btn"
                      disabled={loading}
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
              disabled={loading}
            >
              + Add Variant
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
           
            
            <button 
              type="submit" 
              className="variants-button"
              disabled={variants.filter(v => v.trim() !== '').length < 2 || loading}
            >
              {loading ? 'Creating Variants...' : 'Next: Add Items →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Variants;
