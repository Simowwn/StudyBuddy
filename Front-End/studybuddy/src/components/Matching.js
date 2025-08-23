import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matching.css';

function Matching() {
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, name: 'Xylose', category: 'monosaccharide' },
    { id: 2, name: 'Glucose', category: 'monosaccharide' },
    { id: 3, name: 'Sucrose', category: 'disaccharide' }
  ]);
  
  const [monosaccharides, setMonosaccharides] = useState([]);
  const [disaccharides, setDisaccharides] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Remove from original location
    if (monosaccharides.find(item => item.id === draggedItem.id)) {
      setMonosaccharides(prev => prev.filter(item => item.id !== draggedItem.id));
    } else if (disaccharides.find(item => item.id === draggedItem.id)) {
      setDisaccharides(prev => prev.filter(item => item.id !== draggedItem.id));
    } else {
      setItems(prev => prev.filter(item => item.id !== draggedItem.id));
    }

    // Add to target category
    if (targetCategory === 'monosaccharide') {
      setMonosaccharides(prev => [...prev, draggedItem]);
    } else if (targetCategory === 'disaccharide') {
      setDisaccharides(prev => [...prev, draggedItem]);
    } else if (targetCategory === 'items') {
      setItems(prev => [...prev, draggedItem]);
    }

    setDraggedItem(null);
  };

  const resetQuiz = () => {
    setItems([
      { id: 1, name: 'Xylose', category: 'monosaccharide' },
      { id: 2, name: 'Glucose', category: 'monosaccharide' },
      { id: 3, name: 'Sucrose', category: 'disaccharide' }
    ]);
    setMonosaccharides([]);
    setDisaccharides([]);
  };

  const checkProgress = () => {
    const correctMonosaccharides = monosaccharides.filter(item => item.category === 'monosaccharide').length;
    const correctDisaccharides = disaccharides.filter(item => item.category === 'disaccharide').length;
    
    if (correctMonosaccharides === 2 && correctDisaccharides === 1) {
      alert('Perfect! All items are correctly categorized!');
    } else {
      alert(`Progress: ${correctMonosaccharides + correctDisaccharides}/3 items correctly placed`);
    }
  };

  const goHome = () => {
    navigate('/home');
  };

  return (
    <div className="matching-container">
      <div className="matching-header">
        <div className="matching-icon-circle">
          <span className="matching-icon">🧪</span>
        </div>
        <h1>Matching Quiz</h1>
        <p>Drag and drop items into the correct categories</p>
      </div>

      <div className="matching-content">
        {/* Items to Match (now a drop zone too) */}
        <div 
          className="items-section drop-zone"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'items')}
        >
          <div className="section-header">
            <h2>Items to Match</h2>
            <div className="count-badge">{items.length}</div>
          </div>
          <div className="items-container">
            {items.length === 0 ? (
              <span className="drop-placeholder">Drop items back here</span>
            ) : (
              items.map(item => (
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

        {/* Drop Zones */}
        <div className="drop-zones">
          <div 
            className="drop-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'monosaccharide')}
          >
            <div className="section-header">
              <h2>Monosaccharides</h2>
              <div className="count-badge">{monosaccharides.length}</div>
            </div>
            <div className="drop-area">
              {monosaccharides.length === 0 ? (
                <span className="drop-placeholder">Drop items here</span>
              ) : (
                monosaccharides.map(item => (
                  <div 
                    key={item.id} 
                    className="dropped-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {item.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div 
            className="drop-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'disaccharide')}
          >
            <div className="section-header">
              <h2>Disaccharides</h2>
              <div className="count-badge">{disaccharides.length}</div>
            </div>
            <div className="drop-area">
              {disaccharides.length === 0 ? (
                <span className="drop-placeholder">Drop items here</span>
              ) : (
                disaccharides.map(item => (
                  <div 
                    key={item.id} 
                    className="dropped-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {item.name}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={resetQuiz} className="action-button reset-button">
            <span className="button-icon">🔄</span>
            Reset Quiz
          </button>
          <button onClick={checkProgress} className="action-button check-button">
            <span className="button-icon">✅</span>
            Check Progress
          </button>
          <button onClick={goHome} className="action-button home-button">
            <span className="button-icon">🏠</span>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Matching;
