import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import './Items.css';

function Edit() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [originalItems, setOriginalItems] = useState([]);

  useEffect(() => {
    const loadQuizData = async () => {
      setLoading(true);
      setError('');
      try {
        const quiz = await quizService.getQuiz(quizId);
        setQuizTitle(quiz.title || 'Untitled Quiz');

        const vs = await quizService.getVariantsByQuiz(quizId);
        setVariants(vs);

        if (vs.length > 0) {
          const firstVariant = vs[0];
          setSelectedVariantId(firstVariant.id);
          const variantItems = await quizService.getItemsByVariant(firstVariant.id);
          const names = variantItems.map(item => item.name).join(', ');
          setItemsText(names);
          setOriginalItems(variantItems);
        }
      } catch (e) {
        console.error('Failed to load quiz data:', e);
        setError('Failed to load quiz data.');
      } finally {
        setLoading(false);
      }
    };
    loadQuizData();
  }, [quizId]);

  const onChangeVariant = async (e) => {
    const newVariantId = e.target.value;
    setSelectedVariantId(newVariantId);
    setItemsText(''); // <--- KEY CHANGE: Clear the textbox immediately
    setOriginalItems([]); // and clear the original items state
    setError('');
    setSuccessMessage('');

    if (!newVariantId) {
      return;
    }

    try {
      setLoading(true);
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

  const onSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!selectedVariantId) {
      setError('Please select a variant.');
      return;
    }

    const currentNames = itemsText.split(',').map(s => s.trim()).filter(Boolean);
    const originalNames = originalItems.map(item => item.name);

    const itemsToAdd = currentNames.filter(name => !originalNames.includes(name));
    const itemsToDelete = originalItems.filter(item => !currentNames.includes(item.name));

    if (itemsToAdd.length === 0 && itemsToDelete.length === 0) {
      setSuccessMessage('No changes to save.');
      return;
    }

    try {
      setSaving(true);
      
      await Promise.all([
        ...itemsToDelete.map(item => quizService.deleteItem(item.id)),
        ...itemsToAdd.map(name => quizService.createItem({ name, variant: selectedVariantId }))
      ]);

      const updatedItems = await quizService.getItemsByVariant(selectedVariantId);
      setItemsText(updatedItems.map(item => item.name).join(', '));
      setOriginalItems(updatedItems);
      
      const variantName = variants.find(v => v.id === selectedVariantId)?.name;
      setSuccessMessage(`Items for variant "${variantName}" have been saved successfully!`);
    } catch (e) {
      console.error('Failed to save items:', e);
      setError('Failed to save items. Please try again.');
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