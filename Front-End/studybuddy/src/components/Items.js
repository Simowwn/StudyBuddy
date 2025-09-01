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
  const [hasLoadedItems, setHasLoadedItems] = useState(false);

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

  // Clear items when no variant is selected
  useEffect(() => {
    if (!selectedVariantId) {
      setItemsText('');
      setOriginalItems([]);
      setHasLoadedItems(false);
    }
  }, [selectedVariantId]);

  // Don't render if data is invalid
  if (!isValid) {
    return null;
  }

  const handleVariantChange = (e) => {
    const newVariantId = e.target.value;
    setSelectedVariantId(newVariantId);
    setItemsText('');
    setOriginalItems([]);
    setError('');
    setSuccessMessage('');
    setHasLoadedItems(false);

    // Don't auto-load items when variant is selected
    // Let user start with empty textarea for better UX
  };

  const loadExistingItems = async () => {
    if (!selectedVariantId || hasLoadedItems) return;
    
    setLoading(true);
    try {
      const variantItems = await quizService.getItemsByVariant(selectedVariantId);
      if (variantItems.length > 0) {
        const names = variantItems.map((item) => item.name).join(', ');
        setItemsText(names);
        setOriginalItems(variantItems);
        const variantName = variants.find(v => v.id === selectedVariantId)?.name;
        setSuccessMessage(`Loaded ${variantItems.length} existing items for variant "${variantName}"`);
      }
      setHasLoadedItems(true);
    } catch (e) {
      console.error('Failed to load items:', e);
      setError('Failed to load existing items.');
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
      // If we haven't loaded existing items yet, load them first to avoid conflicts
      if (!hasLoadedItems) {
        const existingItems = await quizService.getItemsByVariant(selectedVariantId);
        setOriginalItems(existingItems);
        setHasLoadedItems(true);
      }

      const currentNames = itemsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const originalNames = originalItems.map((item) => item.name);

      const itemsToAdd = currentNames.filter(
        (name) => !originalNames.includes(name)
      );
      const itemsToDelete = originalItems.filter(
        (item) => !currentNames.includes(item.name)
      );

      if (itemsToAdd.length === 0 && itemsToDelete.length === 0) {
        setSuccessMessage('No changes to save.');
        setSaving(false);
        return;
      }

      await Promise.all([
        ...itemsToDelete.map((item) => quizService.deleteItem(item.id)),
        ...itemsToAdd.map((name) =>
          quizService.createItem({ name, variant: selectedVariantId })
        ),
      ]);

      const updatedItems = await quizService.getItemsByVariant(selectedVariantId);
      setItemsText(updatedItems.map((item) => item.name).join(', '));
      setOriginalItems(updatedItems);

      const variantName = variants.find(
        (v) => v.id === selectedVariantId
      )?.name;
      setSuccessMessage(
        `Items for variant "${variantName}" have been saved successfully!`
      );
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
        message: `Quiz "${quizTitle}" is ready. Now let's set up the matching.`,
      },
    });
  };

  const handleBack = () => {
    navigate('/variants', {
      state: {
        quizId: quizId,
        quizTitle: quizTitle,
      },
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
                <option key={variant.id} value={variant.id}>
                  {variant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="itemsInput">Quiz Items</label>
            {!selectedVariantId ? (
              <p className="form-hint">
                Please select a variant to add quiz items.
              </p>
            ) : (
              <>
                <textarea
                  id="itemsInput"
                  value={itemsText}
                  onChange={handleItemsChange}
                  placeholder="Enter your quiz items separated by commas (e.g., Question 1, Question 2, ...)"
                  rows="6"
                  required
                  disabled={loading || saving}
                />
                {selectedVariantId && !hasLoadedItems && (
                  <div className="form-actions-inline">
                    <button
                      type="button"
                      className="load-existing-button"
                      onClick={loadExistingItems}
                      disabled={loading || saving}
                    >
                      {loading ? 'Loading...' : 'Load Existing Items'}
                    </button>
                    <span className="or-text">or start fresh above</span>
                  </div>
                )}
              </>
            )}
            {selectedVariantId && (
              <p className="form-hint">
                Enter each quiz item separated by commas.
              </p>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="items-button save-button"
              onClick={handleSaveItems}
              disabled={!selectedVariantId || !itemsText.trim() || saving || loading}
            >
              {saving ? 'Saving...' : 'Save Items'}
            </button>

            <button
              type="button"
              className="continue-button"
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