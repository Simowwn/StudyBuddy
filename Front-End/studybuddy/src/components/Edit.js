import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import './Items.css';

function Edit() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(''); // Use ID for better tracking
  const [itemsText, setItemsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [originalItems, setOriginalItems] = useState([]); // Store original items for diffing

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const quiz = await quizService.getQuiz(quizId);
        setQuizTitle(quiz.title || 'Untitled Quiz');

        const vs = await quizService.getVariantsByQuiz(quizId);
        const filtered = vs.filter(v => 
          String(v.quiz) === String(quizId) || 
          String(v.quiz_id) === String(quizId) || 
          String(v.quiz?.id) === String(quizId)
        );
        setVariants(filtered);

        if (filtered.length > 0) {
          const firstVariant = filtered[0];
          setSelectedVariantId(firstVariant.id);
          const variantItems = await quizService.getItemsByVariant(firstVariant.id);
          const names = (variantItems || []).map(it => it.name).join(', ');
          setItemsText(names);
          setOriginalItems(variantItems);
        }
      } catch (e) {
        console.error('Failed to load quiz for edit:', e);
        setError('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  const onChangeVariant = async (e) => {
    const newVariantId = e.target.value;
    setSelectedVariantId(newVariantId);
    setError('');
    setSuccessMessage('');

    if (!newVariantId) {
      setItemsText('');
      setOriginalItems([]);
      return;
    }

    try {
      setLoading(true);
      const variantItems = await quizService.getItemsByVariant(newVariantId);
      const names = (variantItems || []).map(it => it.name).join(', ');
      setItemsText(names);
      setOriginalItems(variantItems);
    } catch (e) {
      console.error('Failed to load items:', e);
      setError('Failed to load items for selected variant.');
      setItemsText('');
      setOriginalItems([]);
    } finally {
      setLoading(false);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedVariantId) {
      setError('Please select a variant');
      return;
    }

    const currentItems = itemsText.split(',').map(s => s.trim()).filter(Boolean);
    const originalNames = originalItems.map(item => item.name);

    // Items to be added (new names not in original list)
    const newItems = currentItems.filter(name => !originalNames.includes(name));

    // Items to be deleted (original names not in new list)
    const itemsToDelete = originalItems.filter(item => !currentItems.includes(item.name));

    if (newItems.length === 0 && itemsToDelete.length === 0) {
      setSuccessMessage('No changes to save.');
      return;
    }

    try {
      setSaving(true);
      // Delete removed items
      await Promise.all(itemsToDelete.map(item => quizService.deleteItem(item.id)));

      // Add new items
      await Promise.all(newItems.map(name => quizService.createItem({ 
        name, 
        variant: selectedVariantId 
      })));

      // Refresh the state to reflect the latest changes from the backend
      const updatedItems = await quizService.getItemsByVariant(selectedVariantId);
      setItemsText(updatedItems.map(it => it.name).join(', '));
      setOriginalItems(updatedItems);

      setSuccessMessage(`Items for variant "${variants.find(v => v.id === selectedVariantId)?.name}" have been saved successfully!`);
    } catch (e) {
      console.error('Failed to update items:', e);
      setError('Failed to update items. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onContinueToMatching = () => {
    navigate('/matching', {
      state: {
        quizId: Number(quizId),
        quizTitle,
        variants,
        message: `Quiz "${quizTitle}" is ready. Now adjust matching if needed.`
      }
    });
  };

  return (
    <div className="items-form">
      <div className="items-header">
        <div className="items-icon-circle">
          <span className="list-icon">📝</span>
        </div>
        <h1>Edit Quiz Items</h1>
        <p>Update the questions and answers for your quiz</p>
      </div>

      <div className="items-content">
        <form onSubmit={onSave}>
          <div className="form-group">
            <label>Quiz Title</label>
            <div className="quiz-title-display">
              <h3>{quizTitle || 'Untitled Quiz'}</h3>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="variantSelect">Select Variant</label>
            <select
              id="variantSelect"
              value={selectedVariantId}
              onChange={onChangeVariant}
              required
              disabled={loading || saving}
            >
              <option value="">Choose a variant...</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="itemsInput">Quiz Items</label>
            <textarea
              id="itemsInput"
              value={itemsText}
              onChange={(e) => {
                setItemsText(e.target.value);
                setError('');
                setSuccessMessage('');
              }}
              placeholder="Enter your quiz items separated by commas (e.g., Question 1, Question 2, ...)"
              rows="6"
              required
              disabled={loading || saving}
            />
            <p className="form-hint">
              Enter each quiz item separated by commas.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="items-button save-button"
              disabled={!selectedVariantId || loading || saving}
            >
              {saving ? 'Saving...' : 'Save Items'}
            </button>

            <button
              type="button"
              className="items-button continue-button"
              onClick={onContinueToMatching}
              disabled={loading || saving}
            >
              Continue to Matching →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;