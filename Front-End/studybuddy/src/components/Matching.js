import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import quizService from '../services/quizService';
import './Matching.css';

function Matching() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId: urlQuizId } = useParams(); // Get quiz ID from URL if available
  
  // Get quiz data from navigation state or URL
  const stateQuizId = location.state?.quizId;
  const quizId = urlQuizId || stateQuizId;
  const quizTitle = location.state?.quizTitle || 'Untitled Quiz';
  const variants = location.state?.variants || [];
  const items = location.state?.items || [];
  const message = location.state?.message;

  const [quizItems, setQuizItems] = useState([]);
  const [matchedItems, setMatchedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
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
  // Store original items for reset functionality
  const [originalItems, setOriginalItems] = useState([]);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalPercentage, setModalPercentage] = useState(0);

  // Initialize quiz data - either from state or fetch from API
  useEffect(() => {
    const initializeQuiz = async () => {
      if (message) {
        setSuccessMessage(message);
      }

      // If we have complete data from navigation state, use it
      if (stateQuizId && variants.length > 0 && items.length > 0) {
        setCurrentQuiz({
          id: stateQuizId,
          title: quizTitle,
          variants: variants,
          items: items
        });
        
        // Convert items array to quiz items format
        const formattedItems = items.map((item, index) => ({
          id: item.id || index + 1,
          name: item.name,
          category: 'unmatched',
          correctVariantId: item.variant // Store the correct variant ID for validation
        }));
        setQuizItems(formattedItems);
        setOriginalItems(formattedItems); // Store original items for reset

        // Initialize matched items for each variant
        const initialMatched = {};
        variants.forEach(variant => {
          initialMatched[variant.id] = [];
        });
        setMatchedItems(initialMatched);
      } 
      // If we only have quiz ID (from URL or state), fetch the data
      else if (quizId) {
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

          // Convert items array to quiz items format
          const allItems = completeQuiz.variants?.flatMap(variant => variant.items || []) || [];
          const formattedItems = allItems.map((item, index) => {
            // Find the variant that contains this item
            const parentVariant = completeQuiz.variants?.find(variant => 
              variant.items?.some(variantItem => variantItem.id === item.id)
            );
            
            const formattedItem = {
              id: item.id || index + 1,
              name: item.name,
              category: 'unmatched',
              correctVariantId: parentVariant?.id || item.variant // Use parent variant ID or fallback to item.variant
            };
            
            console.log(`Item "${item.name}" belongs to variant ID: ${formattedItem.correctVariantId} (variant name: ${parentVariant?.name || 'unknown'})`);
            
            return formattedItem;
          });
          setQuizItems(formattedItems);
          setOriginalItems(formattedItems); // Store original items for reset

          // Initialize matched items for each variant
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
  }, [quizId, stateQuizId, message, quizTitle, variants.length, items.length]); // Fixed dependencies

  // Redirect if no quiz ID
  if (!quizId) {
    navigate('/quiz');
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="matching-container">
        <div className="loading-message">Loading quiz...</div>
      </div>
    );
  }

  // Show error state
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

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetVariantId) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Clear any existing validation when moving items
    if (showValidation) {
      setShowValidation(false);
      setValidationResults({});
    }

    // Remove from original location
    if (draggedItem.category === 'unmatched') {
      setQuizItems(prev => prev.filter(item => item.id !== draggedItem.id));
    } else {
      // Remove from previous variant
      setMatchedItems(prev => ({
        ...prev,
        [draggedItem.category]: prev[draggedItem.category].filter(item => item.id !== draggedItem.id)
      }));
    }

    // Add to target variant with updated category
    const updatedItem = { ...draggedItem, category: targetVariantId };
    setMatchedItems(prev => ({
      ...prev,
      [targetVariantId]: [...(prev[targetVariantId] || []), updatedItem]
    }));

    setDraggedItem(null);
  };

  const handleDropBackToItems = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Clear any existing validation when moving items
    if (showValidation) {
      setShowValidation(false);
      setValidationResults({});
    }

    // Remove from variant if it was in one
    if (draggedItem.category !== 'unmatched') {
      setMatchedItems(prev => ({
        ...prev,
        [draggedItem.category]: prev[draggedItem.category].filter(item => item.id !== draggedItem.id)
      }));
    }

    // Add back to items with reset category
    const resetItem = { ...draggedItem, category: 'unmatched' };
    setQuizItems(prev => {
      // Check if item already exists to prevent duplicates
      const exists = prev.some(item => item.id === resetItem.id);
      return exists ? prev : [...prev, resetItem];
    });

    setDraggedItem(null);
  };

  const resetQuiz = () => {
    // Clear validation
    setShowValidation(false);
    setValidationResults({});
    
    // Reset to original state
    setQuizItems([...originalItems]);
    setMatchedItems(
      currentQuiz.variants.reduce((acc, variant) => {
        acc[variant.id] = [];
        return acc;
      }, {})
    );
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#22c55e'; // Green
    if (percentage >= 60) return '#eab308'; // Yellow
    if (percentage >= 30) return '#f97316'; // Orange
    return '#ef4444'; // Red
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

    // Check each variant's matched items
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

    // Calculate percentage
    const percentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
    setModalPercentage(percentage);

    // Simple and clean validation messaging
    if (totalMatched === 0) {
      setModalMessage("No items matched yet.\nStart by dragging items to their categories!");
    } else if (unmatched > 0) {
      // Show progress based on total items, not just matched ones
      setModalMessage(`Progress: ${correctCount}/${totalItems} correct\nMatch all ${totalItems} items to complete!`);
    } else {
      // All items are matched - final results
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
        <p>Drag and drop items into the correct categories</p>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✅</span>
          {successMessage}
          <button 
            onClick={() => setSuccessMessage('')} 
            className="close-message"
          >
            ✕
          </button>
        </div>
      )}

      <div className="matching-content">
        {/* Items to Match */}
        <div 
          className="items-section drop-zone"
          onDragOver={handleDragOver}
          onDrop={handleDropBackToItems}
        >
          <div className="section-header">
            <h2>Items to Match</h2>
            <div className="count-badge">{quizItems.length}</div>
          </div>
          <div className="items-container">
            {quizItems.length === 0 ? (
              <span className="drop-placeholder">Drop items back here</span>
            ) : (
              quizItems.map(item => (
                <div
                  key={item.id}
                  className="draggable-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
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
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, variant.id)}
            >
              <div className="section-header">
                <h2>{variant.name}</h2>
                <div className="count-badge">{matchedItems[variant.id]?.length || 0}</div>
              </div>
              <div className="drop-area">
                {!matchedItems[variant.id] || matchedItems[variant.id].length === 0 ? (
                  <span className="drop-placeholder">Drop items here</span>
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
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
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

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <CircularProgress percentage={modalPercentage} />
              <pre className="modal-message">{modalMessage}</pre>
              <button onClick={() => setShowModal(false)} className="modal-close">
                Close
              </button>
              
              {/* Confetti - positioned to cover the entire modal */}
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

        {/* Action Buttons */}
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