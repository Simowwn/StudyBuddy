import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import quizService from '../services/quizService';
import './Items.css';

function Items() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [originalItems, setOriginalItems] = useState([]);

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

  // Load items when a variant is initially selected (e.g., on page load)
  useEffect(() => {
    const loadInitialItems = async () => {
      if (variants.length > 0) {
        const firstVariant = variants[0];
        setSelectedVariantId(firstVariant.id);
        setLoading(true);
        try {
          const variantItems = await quizService.getItemsByVariant(firstVariant.id);
          const names = variantItems.map(item => item.name).join(', ');
          setItemsText(names);
          setOriginalItems(variantItems);
        } catch (e) {
          console.error('Failed to load initial items:', e);
          setError('Failed to load items for the first variant.');
        } finally {
          setLoading(false);
        }
      }
    };
    loadInitialItems();
  }, [variants]);

  // Don't render if data is invalid
  if (!isValid) {
    return null;
  }

  const handleVariantChange = async (e) => {
    const newVariantId = e.target.value;
    setSelectedVariantId(newVariantId);
    setItemsText(''); // Clear the text box immediately
    setOriginalItems([]);
    setError('');
    setSuccessMessage('');
    
    if (!newVariantId) {
      return;
    }

    setLoading(true);
    try {
      const variantItems = await quizService.getItemsByVariant(newVariantId);
      const names = variantItems.map(item => item.name).join(', ');
      setItemsText(names);
      setOriginalItems(variantItems);
    } catch (e) {
      console.error('Failed to load items:', e);
      setError('Failed to load items for selected variant.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemsChange = (e) => {
    setItemsText(e.target.value);
    setError('');
    setSuccessMessage('');
  };

  const handleSaveItems = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedVariantId) {
      setError('Please select a variant.');
      return;
    }

    if (!itemsText.trim()) {
      setError('Please enter quiz items.');
      return;
    }

    setSaving(true);
    try {
      const currentNames = itemsText.split(',').map(s => s.trim()).filter(Boolean);
      const originalNames = originalItems.map(item => item.name);

      const itemsToAdd = currentNames.filter(name => !originalNames.includes(name));
      const itemsToDelete = originalItems.filter(item => !currentNames.includes(item.name));

      if (itemsToAdd.length === 0 && itemsToDelete.length === 0) {
        setSuccessMessage('No changes to save.');
        setSaving(false);
        return;
      }

      await Promise.all([
        ...itemsToDelete.map(item => quizService.deleteItem(item.id)),
        ...itemsToAdd.map(name => quizService.createItem({ name, variant: selectedVariantId }))
      ]);

      const updatedItems = await quizService.getItemsByVariant(selectedVariantId);
      setItemsText(updatedItems.map(item => item.name).join(', '));
      setOriginalItems(updatedItems);

      const variantName = variants.find(v => v.id === selectedVariantId)?.name;
      setSuccessMessage(`Items for variant "${variantName}" have been saved successfully!`);
    } catch (error) {
      console.error('Error saving items:', error);
      setError(error.message || 'Failed to save items. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    navigate('/matching', { 
      state: { 
        quizId: quizId,
        quizTitle: quizTitle,
        variants: variants,
        message: `Quiz "${quizTitle}" is ready. Now let's set up the matching.`
      } 
    });
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
        <form onSubmit={handleSaveItems}>
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
              value={selectedVariantId}
              onChange={handleVariantChange}
              required
              disabled={loading || saving}
            >
              <option value="">Choose a variant...</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
          </div>
          <h1>Quiz Items</h1>

          <div className="form-group">
            <label htmlFor="itemsInput">Quiz Items</label>
            <textarea
              id="itemsInput"
              value={itemsText}
              onChange={handleItemsChange}
              placeholder="Enter your quiz items separated by commas (e.g., Question 1, Question 2, ...)"
              rows="6"
              required
              disabled={!selectedVariantId || loading || saving}
            />
            <p className="form-hint">
              Enter each quiz item separated by commas.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <div className="form-actions">
            <button 
              type="button" // Use type="button" to prevent form submission
              className="items-button save-button"
              onClick={handleSaveItems}
              disabled={!selectedVariantId || !itemsText.trim() || saving || loading}
            >
              {saving ? 'Saving...' : 'Save Items'}
            </button>
            
            <button
              type="button"
              className="items-button continue-button"
              onClick={handleContinue}
              disabled={!selectedVariantId || saving || loading}
            >
              Continue to Matching →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Items;