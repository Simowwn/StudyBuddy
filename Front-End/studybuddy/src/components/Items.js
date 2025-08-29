import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import quizService from '../services/quizService';
import './Items.css';

function Items() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedVariant, setSelectedVariant] = useState('');
  const [items, setItems] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Get quiz data and variants from navigation state
  const quizId = location.state?.quizId;
  const quizTitle = location.state?.quizTitle || 'Untitled Quiz';
  const variants = location.state?.variants || [];

  // Check if we have valid data and redirect if needed
  useEffect(() => {
    if (!quizId || !variants.length) {
      setIsValid(false);
      navigate('/quiz');
    }
  }, [quizId, variants.length, navigate]);

  // Don't render if data is invalid
  if (!isValid) {
    return null;
  }

  const handleVariantChange = (e) => {
    setSelectedVariant(e.target.value);
    setError('');
  };

  const handleItemsChange = (e) => {
    setItems(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedVariant) {
      setError('Please select a variant');
      return;
    }

    if (!items.trim()) {
      setError('Please enter quiz items');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Parse items from comma-separated string
      const itemNames = items.split(',').map(item => item.trim()).filter(item => item);
      
      if (itemNames.length === 0) {
        setError('Please enter at least one valid item');
        return;
      }

      // Find the selected variant object
      const selectedVariantObj = variants.find(v => v.name === selectedVariant);
      if (!selectedVariantObj) {
        setError('Selected variant not found');
        return;
      }

      // Create all items in a single request with comma-separated names
      const itemData = {
        name: items.trim(), // Send the original comma-separated string
        variant: selectedVariantObj.id
      };
      
      const createdItems = await quizService.createItem(itemData);
      
      console.log('Items created successfully:', createdItems);
      
      // Navigate to matching page with quiz data
      navigate('/matching', { 
        state: { 
          quizId: quizId,
          quizTitle: quizTitle,
          variants: variants,
          items: createdItems,
          message: `Quiz "${quizTitle}" created successfully! Now let's set up the matching.`
        } 
      });
    } catch (error) {
      console.error('Error creating items:', error);
      setError(error.message || 'Failed to create items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/variants', { 
      state: { 
        quizId: quizId,
        quizTitle: quizTitle 
      } 
    });
  };

  return (
    <div className="items-form">
      <div className="items-header">
        <div className="items-icon-circle">
          <span className="list-icon">📝</span>
        </div>
        <h1>Add Quiz Items</h1>
        <p>Create the actual questions and answers for your quiz</p>
      </div>
      
      <div className="items-content">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quiz Title</label>
            <div className="quiz-title-display">
              <h3>{quizTitle}</h3>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="variantSelect">Select Variant</label>
            <select
              id="variantSelect"
              value={selectedVariant}
              onChange={handleVariantChange}
              required
              disabled={loading}
            >
              <option value="">Choose a variant...</option>
              {variants.map((variant, index) => (
                <option key={index} value={variant.name}>{variant.name}</option>
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
              disabled={loading}
            />
            <p className="form-hint">
              Enter each quiz item separated by commas. You can add as many items as you need.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            
            
            <button 
              type="submit" 
              className="items-button"
              disabled={!selectedVariant || !items.trim() || loading}
            >
              {loading ? 'Creating Items...' : 'Next: Start Matching →'}
            </button>
            <h1>ITEM PUSHED</h1>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Items;
