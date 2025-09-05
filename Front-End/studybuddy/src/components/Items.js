import React, { useState, useEffect, useMemo } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import quizService from "../services/quizService";

import "./Items.css";

function Items() {
  const navigate = useNavigate();

  const location = useLocation();

  const [selectedVariantId, setSelectedVariantId] = useState("");

  const [itemsText, setItemsText] = useState("");

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [isValid, setIsValid] = useState(true);
  const [currentVariantItems, setCurrentVariantItems] = useState([]);

  // Get quiz data and variants from navigation state

  const quizId = location.state?.quizId;

  const quizTitle = location.state?.quizTitle || "Untitled Quiz";

  const variants = location.state?.variants || [];

  // Memoize first variant id for stable dependency
  const firstVariantId = useMemo(() => {
    const first = variants && variants.length > 0 ? variants[0] : null;
    return first?.id ? String(first.id) : "";
  }, [variants]);

  // Load items when variant changes
  useEffect(() => {
    const loadItems = async () => {
      if (!selectedVariantId) return;
      
      try {
        setLoading(true);
        const variantItems = (await quizService.getItemsByVariant(selectedVariantId)) || [];
        // Be robust to different quiz id shapes coming from API
        const filteredItems = variantItems.filter((item) =>
          String(item.quiz) === String(quizId) ||
          String(item.quiz_id) === String(quizId) ||
          String(item.quiz?.id) === String(quizId)
        );
        setCurrentVariantItems(filteredItems);
        setItemsText(filteredItems.map(item => item.name).join(', '));
      } catch (error) {
        console.error("Error loading items:", error);
        setError("Failed to load items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [selectedVariantId, quizId]);

  // Set default selected variant if none selected yet
  useEffect(() => {
    if (!selectedVariantId && firstVariantId) {
      setSelectedVariantId(firstVariantId);
    }
  }, [firstVariantId, selectedVariantId]);

  // Check if we have valid data and redirect if needed
  useEffect(() => {
    if (!quizId || !variants.length) {
      setIsValid(false);
      navigate("/quiz");
    }
  }, [quizId, variants.length, navigate]);

  // Handle variant change
  const handleVariantChange = (e) => {
    const newVariantId = e.target.value;
    setSelectedVariantId(newVariantId);
    setItemsText("");
    setError("");
    setSuccessMessage("");
  };

  const handleItemsChange = (e) => {
    setItemsText(e.target.value);

    setError("");

    setSuccessMessage("");
  };

  const handleSaveItems = async (e) => {
    e.preventDefault();

    setError("");

    setSuccessMessage("");

    if (!selectedVariantId) {
      setError("Please select a variant.");

      return;
    }

    if (!itemsText.trim()) {
      setError("Please enter quiz items.");

      return;
    }

    setSaving(true);

    try {
      // Step 1: Delete existing items for THIS QUIZ under the selected variant
      const existingItems = (await quizService.getItemsByVariant(selectedVariantId)) || [];
      const toDelete = existingItems.filter(
        (item) =>
          String(item.quiz) === String(quizId) ||
          String(item.quiz_id) === String(quizId) ||
          String(item.quiz?.id) === String(quizId)
      );
      await Promise.all(toDelete.map((item) => quizService.deleteItem(item.id)));

      // Step 2: Create new items from the text area

      const names = itemsText

        .split(",")

        .map((s) => s.trim())

        .filter(Boolean);

      if (names.length === 0) {
        setError("Please enter at least one valid item.");

        setSaving(false);

        return;
      }

      const newItems = await Promise.all(
        names.map((name) =>
          quizService.createItem({
            name,
            variant: selectedVariantId,
            quiz: quizId,
          })
        )
      );

      const variantName = variants.find(
        (v) => String(v.id) === String(selectedVariantId)
      )?.name;

      // Update the current variant items
      setCurrentVariantItems(newItems);

      setSuccessMessage(
        `Items for variant "${variantName}" have been saved successfully!`
      );
    } catch (error) {
      console.error("Error saving items:", error);

      setError(error.message || "Failed to save items. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    navigate("/matching", {
      state: {
        quizId: quizId,

        quizTitle: quizTitle,

        variants: variants,

        message: `Quiz "${quizTitle}" is ready. Now let's set up the matching.`,
      },
    });
  };

  const handleBack = () => {
    navigate("/variants", {
      state: {
        quizId: quizId,

        quizTitle: quizTitle,
      },
    });
  };

  if (!isValid) {
    return null;
  }

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

            {loading ? (
              <p className="loading-message">Loading items...</p>
            ) : !selectedVariantId ? (
              <p className="form-hint">
                Please select a variant to add quiz items.
              </p>
            ) : (
              <textarea
                id="itemsInput"
                value={itemsText}
                onChange={handleItemsChange}
                placeholder="Enter your quiz items separated by commas (e.g., Question 1, Question 2, ...)"
                rows="6"
                required
                disabled={saving}
              />
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
              type="submit"
              className="btn btn-primary save-button"
              disabled={
                !selectedVariantId || !itemsText.trim() || saving || loading
              }
            >
              {saving ? "Saving..." : "Save Items"}
            </button>

            <button
              type="button"
              className="btn btn-secondary continue-button"
              onClick={handleContinue}
              disabled={loading || saving}
            >
              Continue to Matching →
            </button>
          </div>
        </form>
      </div>

      <div className="all-items-section">
        <h3>Current Variant Items</h3>
        {selectedVariantId ? (
          currentVariantItems.length > 0 ? (
            <div className="items-grid">
              {currentVariantItems.map((item, index) => (
                <div key={item.id || index} className="item-card">
                  <div className="item-name">{item.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No items have been added to this variant yet.</p>
          )
        ) : (
          <p>Select a variant to view its items.</p>
        )}
      </div>
    </div>
  );
}

export default Items;
