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

  // Load quiz and variants
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      setError('');
      try {
        const quiz = await quizService.getQuiz(quizId);
        const title = quiz.title || 'Untitled Quiz';
        setQuizTitle(title);

        const vs = await quizService.getVariantsByQuiz(quizId);
        const filtered = (vs || []).filter(v => {
          const matchesId =
            String(v.quiz) === String(quizId) ||
            String(v.quiz_id) === String(quizId) ||
            String(v.quiz?.id) === String(quizId);
          const matchesTitle =
            (v.quiz_title && v.quiz_title === title) ||
            (v.quiz?.title && v.quiz?.title === title);
          return matchesId || matchesTitle;
        });
        setVariants(filtered);

        if (filtered.length > 0) {
          const first = filtered[0];
          setSelectedVariant(first.name);
          await loadItemsForVariant(first.id);
        }
      } catch (e) {
        console.error('Failed to load quiz for edit:', e);
        window.alert('Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  // helper: load items for a variant and this quiz
  const loadItemsForVariant = async (variantId) => {
    try {
      setLoading(true);
      const variantItems = (await quizService.getItemsByVariant(variantId)) || [];
      const filteredItems = variantItems.filter(
        it =>
          String(it.quiz) === String(quizId) ||
          String(it.quiz_id) === String(quizId) ||
          String(it.quiz?.id) === String(quizId)
      );
      setItemsText(filteredItems.map(it => it.name).join(', '));
    } catch (e) {
      console.error('Failed to load items:', e);
      setError('Failed to load items for selected variant.');
    } finally {
      setLoading(false);
    }
  };

  const onChangeVariant = async (e) => {
    const value = e.target.value;
    setSelectedVariant(value);
    setError('');
    setSuccessMessage('');
    const v = variants.find(vr => vr.name === value);
    if (v) {
      await loadItemsForVariant(v.id);
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

      // delete only this quiz's items for the variant
      const existing = await quizService.getItemsByVariant(selectedVariantObj.id);
      for (const it of (existing || [])) {
        if (String(it.quiz) === String(quizId)) {
          try { await quizService.deleteItem(it.id); } catch (_) {}
        }
      }

      // split and create each item individually
      const names = itemsText.split(',').map(s => s.trim()).filter(Boolean);
      if (names.length === 0) {
        setError('Please enter at least one valid item');
        return;
      }

      for (const n of names) {
        await quizService.createItem({
          name: n,
          variant: selectedVariantObj.id,
          quiz: quizId
        });
      }

      setSuccessMessage(`Items for variant "${selectedVariant}" have been saved successfully!`);
    } catch (e) {
      console.error('Failed to update items:', e);
      window.alert('Failed to save quiz.');
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

  const handleDeleteQuiz = async () => {
    if (window.confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await quizService.deleteQuiz(quizId);
        window.alert(`Quiz "${quizTitle}" has been deleted successfully.`);
        navigate('/');
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        setError('Failed to delete quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    }
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
              className="continue-button"
              onClick={onContinueToMatching}
              disabled={loading || saving}
            >
              Continue to Matching →
            </button>

            <button
              type="button"
              className="delete-button"
              onClick={handleDeleteQuiz}
              disabled={loading || saving}
              style={{
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '10px',
                opacity: (loading || saving) ? 0.6 : 1,
                pointerEvents: (loading || saving) ? 'none' : 'auto'
              }}
            >
              {loading ? 'Deleting...' : 'Delete Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Edit;
