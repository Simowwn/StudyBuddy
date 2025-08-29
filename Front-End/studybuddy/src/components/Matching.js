import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import './Matching.css';

function Matching() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId: urlQuizId } = useParams();
  
  const stateQuizId = location.state?.quizId;
  const quizId = urlQuizId || stateQuizId;
  const quizTitle = location.state?.quizTitle || 'Untitled Quiz';
  const variants = location.state?.variants || [];
  const items = location.state?.items || [];
  const message = location.state?.message;

  const [quizItems, setQuizItems] = useState([]);
  const [matchedItems, setMatchedItems] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState({
    id: quizId,
    title: quizTitle,
    variants: variants,
    items: items
  });
  const [validationResults, setValidationResults] = useState({});
  const [showValidation, setShowValidation] = useState(false);
  const [originalItems, setOriginalItems] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalPercentage, setModalPercentage] = useState(0);

  useEffect(() => {
    const initializeQuiz = async () => {
      if (message) {
        setSuccessMessage(message);
      }

      if (stateQuizId && variants.length > 0 && items.length > 0) {
        setCurrentQuiz({
          id: stateQuizId,
          title: quizTitle,
          variants: variants,
          items: items
        });
        
        const formattedItems = items.map((item, index) => ({
          id: item.id || index + 1,
          name: item.name,
          correctVariantId: item.variant
        }));
        setQuizItems(formattedItems);
        setOriginalItems(formattedItems);

        const initialMatched = {};
        variants.forEach(variant => {
          initialMatched[variant.id] = [];
        });
        setMatchedItems(initialMatched);
      } else if (quizId) {
        setLoading(true);
        setError('');
        
        try {
          const completeQuiz = await quizService.getCompleteQuiz(quizId);
          
          setCurrentQuiz({
            id: completeQuiz.id,
            title: completeQuiz.title,
            variants: completeQuiz.variants || [],
            items: completeQuiz.variants?.flatMap(variant => variant.items || []) || []
          });

          const allItems = completeQuiz.variants?.flatMap(variant => variant.items || []) || [];
          const formattedItems = allItems.map((item, index) => {
            const parentVariant = completeQuiz.variants?.find(variant => 
              variant.items?.some(variantItem => variantItem.id === item.id)
            );
            
            return {
              id: item.id || index + 1,
              name: item.name,
              correctVariantId: parentVariant?.id || item.variant
            };
          });
          setQuizItems(formattedItems);
          setOriginalItems(formattedItems);

          const initialMatched = {};
          completeQuiz.variants?.forEach(variant => {
            initialMatched[variant.id] = [];
          });
          setMatchedItems(initialMatched);
        } catch (error) {
          console.error('Error loading quiz:', error);
          setError('Failed to load quiz. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    initializeQuiz();
  }, [quizId, stateQuizId, message, quizTitle, variants.length, items.length]);

  if (!quizId) {
    navigate('/quiz');
    return null;
  }

  if (loading) {
    return (
      <div className="matching-container">
        <div className="loading-message">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="matching-container">
        <div className="error-message">
          <span className="error-icon">❌</span>
          {error}
          <button onClick={() => navigate('/home')} className="close-message">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // --- REVISED LOGIC ---

  const handleItemClick = (item, currentCategory = null) => {
    // If an item is already selected and the user clicks on it again, deselect it.
    if (selectedItem?.id === item.id) {
        setSelectedItem(null);
    } 
    // If the user clicks on a new item, regardless of its location, select it.
    else {
        setSelectedItem({ ...item, category: currentCategory });
    }
  };

  const handleDropZoneClick = (targetVariantId) => {
    // A drop zone was clicked, but no item is currently selected.
    if (!selectedItem) {
      return; 
    }
    
    // An item is selected. Move it to the target variant.
    
    // Clear any existing validation when moving items
    if (showValidation) {
      setShowValidation(false);
      setValidationResults({});
    }

    // Step 1: Remove the item from its current location
    setQuizItems(prev => prev.filter(item => item.id !== selectedItem.id));
    setMatchedItems(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(variantId => {
            newState[variantId] = newState[variantId].filter(item => item.id !== selectedItem.id);
        });
        return newState;
    });

    // Step 2: Add the item to the new location (either a variant or the unmatched list)
    const updatedItem = { ...selectedItem, category: targetVariantId };
    
    if (targetVariantId === 'unmatched') {
      setQuizItems(prev => [...prev, updatedItem]);
    } else {
      setMatchedItems(prev => ({
        ...prev,
        [targetVariantId]: [...(prev[targetVariantId] || []), updatedItem]
      }));
    }

    // Step 3: Clear the selected item state after the drop
    setSelectedItem(null);
  };
  
  // --- END OF REVISED LOGIC ---

  const resetQuiz = () => {
    setShowValidation(false);
    setValidationResults({});
    setQuizItems([...originalItems]);
    setMatchedItems(
      currentQuiz.variants.reduce((acc, variant) => {
        acc[variant.id] = [];
        return acc;
      }, {})
    );
    setSelectedItem(null);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 60) return '#eab308';
    if (percentage >= 30) return '#f97316';
    return '#ef4444';
  };

  const CircularProgress = ({ percentage }) => {
    const radius = 70; 
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const color = getProgressColor(percentage);

    return (
      <div className="circular-progress">
        <svg width="180" height="180" className="progress-ring">
          <circle
            className="progress-ring-background"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
            r="70"
            cx="90"
            cy="90"
          />
          <circle
            className="progress-ring-progress"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            r="70"
            cx="90"
            cy="90"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease'
            }}
          />
        </svg>
        <div className="progress-percentage" style={{ color }}>
          {percentage}%
        </div>
      </div>
    );
  };

  const validateMatches = () => {
    const results = {};
    let correctCount = 0;
    let totalMatched = 0;
    const totalItems = originalItems.length;
    const unmatched = quizItems.length;

    Object.keys(matchedItems).forEach(variantId => {
      const itemsInVariant = matchedItems[variantId] || [];
      const variantResults = [];

      itemsInVariant.forEach(item => {
        const isCorrect = String(item.correctVariantId) === String(variantId);
        variantResults.push({
          itemId: item.id,
          itemName: item.name,
          isCorrect: isCorrect
        });
        
        if (isCorrect) correctCount++;
        totalMatched++;
      });

      results[variantId] = variantResults;
    });

    setValidationResults(results);
    setShowValidation(true);

    const percentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
    setModalPercentage(percentage);

    if (totalMatched === 0) {
      setModalMessage("No items matched yet.\nStart by tapping an item!");
    } else if (unmatched > 0) {
      setModalMessage(`Progress: ${correctCount}/${totalItems} correct\nMatch all ${totalItems} items to complete!`);
    } else {
      setModalMessage(`🎉 Quiz Complete!\nFinal Score: ${correctCount}/${totalItems}`);
    }
    setShowModal(true);
  };

  const clearValidation = () => {
    setShowValidation(false);
    setValidationResults({});
  };

  const goHome = () => {
    navigate('/home');
  };

  const goBack = () => {
    navigate('/items', { 
      state: { 
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        variants: currentQuiz.variants 
      } 
    });
  };

  return (
    <div className="matching-container">
      <div className="matching-header">
        <div className="matching-icon-circle">
          <span className="matching-icon">🧪</span>
        </div>
        <h1>Matching Quiz: {currentQuiz.title}</h1>
        <p>Tap an item, then tap a category to drop it</p>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="close-message">
            ✕
          </button>
        </div>
      )}

      <div className="matching-content">
        {/* Items to Match */}
        <div className="items-section">
          <div className="section-header">
            <h2>Items to Match</h2>
            <div className="count-badge">{quizItems.length}</div>
          </div>
          <div className="items-container" onClick={() => handleDropZoneClick('unmatched')}>
            {quizItems.length === 0 ? (
              <span className="drop-placeholder">All items are matched!</span>
            ) : (
              quizItems.map(item => (
                <div
                  key={item.id}
                  className={`clickable-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  {item.name}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drop Zones for each variant */}
        <div className="drop-zones">
          {currentQuiz.variants.map(variant => (
            <div 
              key={variant.id}
              className="drop-zone"
              onClick={() => handleDropZoneClick(variant.id)}
            >
              <div className="section-header">
                <h2>{variant.name}</h2>
                <div className="count-badge">{matchedItems[variant.id]?.length || 0}</div>
              </div>
              <div className="drop-area">
                {!matchedItems[variant.id] || matchedItems[variant.id].length === 0 ? (
                  <span className="drop-placeholder">Tap here to drop</span>
                ) : (
                  matchedItems[variant.id].map(item => {
                    const isValidationActive = showValidation && validationResults[variant.id];
                    const itemValidation = isValidationActive ? 
                      validationResults[variant.id].find(v => v.itemId === item.id) : null;
                    const isCorrect = itemValidation ? itemValidation.isCorrect : null;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`dropped-item ${
                          isValidationActive 
                            ? isCorrect 
                              ? 'correct-match' 
                              : 'incorrect-match'
                            : ''
                        } ${selectedItem?.id === item.id ? 'selected' : ''}`}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleItemClick(item, variant.id);
                        }}
                      >
                        {item.name}
                        {isValidationActive && (
                          <span className="validation-icon">
                            {isCorrect ? '✅' : '❌'}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <CircularProgress percentage={modalPercentage} />
              <pre className="modal-message">{modalMessage}</pre>
              <button onClick={() => setShowModal(false)} className="modal-close">
                Close
              </button>
              
              {modalPercentage >= 50 && (
                <div className="confetti">
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                  <div className="confetti-piece"></div>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <div className="action-buttons">
            <button onClick={validateMatches} className="action-button validate-button" style={{ width: "100%" }}>
              <span className="button-icon">✅</span>
              Validate Matches
            </button>
          </div>

          <div className="action-buttons">
            <button onClick={goBack} className="action-button back-button">
              <span className="button-icon">←</span>
              Back to Items
            </button>
            <button onClick={resetQuiz} className="action-button reset-button">
              <span className="button-icon">🔄</span>
              Reset Quiz
            </button>
            {showValidation && (
              <button onClick={clearValidation} className="action-button clear-validation-button">
                <span className="button-icon">👁️</span>
                Hide Results
              </button>
            )}
            <button onClick={goHome} className="action-button home-button">
              <span className="button-icon">🏠</span>
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Matching;