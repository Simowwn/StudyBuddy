import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import './Items.css';

function Edit() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch quiz core info
        const quiz = await quizService.getQuiz(quizId);
        const title = quiz.title || 'Untitled Quiz';
        setQuizTitle(title);

        // Fetch variants for this quiz
        const vs = await quizService.getVariantsByQuiz(quizId);
        // Strictly filter to this quiz by id/title in case API returns broader data
        const filtered = (vs || []).filter(v => {
          const matchesId = String(v.quiz) === String(quizId) || String(v.quiz_id) === String(quizId) || String(v.quiz?.id) === String(quizId);
          const matchesTitle = (v.quiz_title && v.quiz_title === title) || (v.quiz?.title && v.quiz?.title === title);
          return matchesId || matchesTitle;
        });
        setVariants(filtered);

        // Auto-select first variant if present
        if (filtered.length > 0) {
          const first = filtered[0];
          setSelectedVariant(first.name);

          // Load items for first variant
          const variantItems = await quizService.getItemsByVariant(first.id);
          const names = (variantItems || []).map(it => it.name);
          setItemsText(names.join(', '));
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
    const value = e.target.value;
    setSelectedVariant(value);
    setError('');
    setSuccessMessage('');

    const v = variants.find(vr => vr.name === value);
    if (!v) return;

    try {
      setLoading(true);
      const variantItems = await quizService.getItemsByVariant(v.id);
      const names = (variantItems || []).map(it => it.name);
      setItemsText(names.join(', '));
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

    if (!selectedVariant) {
      setError('Please select a variant');
      return;
    }

    if (!itemsText.trim()) {
      setError('Please enter quiz items');
      return;
    }

    const selectedVariantObj = variants.find(v => v.name === selectedVariant);
    if (!selectedVariantObj) {
      setError('Selected variant not found');
      return;
    }

    try {
      setSaving(true);
      // Strategy: delete existing items and recreate from comma-separated names
      const existing = await quizService.getItemsByVariant(selectedVariantObj.id);
      for (const it of (existing || [])) {
        try { await quizService.deleteItem(it.id); } catch (_) {}
      }

      const names = itemsText.split(',').map(s => s.trim()).filter(Boolean);
      if (names.length === 0) {
        setError('Please enter at least one valid item');
        return;
      }

      // Backend createItem supports comma-separated names in `name` field (per Items.js)
      await quizService.createItem({ name: names.join(', '), variant: selectedVariantObj.id });

      setSuccessMessage(`Items for variant "${selectedVariant}" have been saved successfully!`);
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
              value={selectedVariant}
              onChange={onChangeVariant}
              required
              disabled={loading || saving}
            >
              <option value="">Choose a variant...</option>
              {variants.map((variant) => (
                <option key={variant.id} value={variant.name}>{variant.name}</option>
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
              disabled={!selectedVariant || !itemsText.trim() || loading || saving}
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