# API Integration Documentation

## Overview
The front-end has been fully integrated with the Django REST API backend. The integration includes comprehensive CRUD operations for quizzes, variants, and items.

## API Endpoints

### Base Configuration
- **Base URL**: `http://127.0.0.1:8000/api`
- **Authentication**: JWT Bearer tokens

### Available Endpoints

#### Quizzes
- `GET /quizzes/quizzes/` - Get all quizzes for authenticated user
- `GET /quizzes/quizzes/{id}/` - Get specific quiz by ID
- `POST /quizzes/quizzes/` - Create new quiz
- `PUT /quizzes/quizzes/{id}/` - Update quiz
- `DELETE /quizzes/quizzes/{id}/` - Delete quiz

#### Variants
- `GET /quizzes/variants/` - Get all variants
- `GET /quizzes/variants/?quiz={quizId}` - Get variants for specific quiz
- `GET /quizzes/variants/{id}/` - Get specific variant by ID
- `POST /quizzes/variants/` - Create new variant
- `PUT /quizzes/variants/{id}/` - Update variant
- `DELETE /quizzes/variants/{id}/` - Delete variant

#### Items
- `GET /quizzes/items/` - Get all items
- `GET /quizzes/items/?variant={variantId}` - Get items for specific variant
- `GET /quizzes/items/{id}/` - Get specific item by ID
- `POST /quizzes/items/` - Create new item
- `PUT /quizzes/items/{id}/` - Update item
- `DELETE /quizzes/items/{id}/` - Delete item

## Service Layer

### QuizService (`src/services/quizService.js`)
The main service class that handles all API interactions:

#### Quiz Methods
- `getQuizzes()` - Fetch all user's quizzes
- `getQuiz(id)` - Fetch specific quiz
- `createQuiz(quizData)` - Create new quiz
- `updateQuiz(id, quizData)` - Update existing quiz
- `deleteQuiz(id)` - Delete quiz

#### Variant Methods
- `getVariants()` - Fetch all variants
- `getVariantsByQuiz(quizId)` - Fetch variants for specific quiz
- `getVariant(id)` - Fetch specific variant
- `createVariant(variantData)` - Create new variant
- `updateVariant(id, variantData)` - Update existing variant
- `deleteVariant(id)` - Delete variant

#### Item Methods
- `getItems()` - Fetch all items
- `getItemsByVariant(variantId)` - Fetch items for specific variant
- `getItem(id)` - Fetch specific item
- `createItem(itemData)` - Create new item
- `updateItem(id, itemData)` - Update existing item
- `deleteItem(id)` - Delete item

#### Composite Methods
- `getCompleteQuiz(quizId)` - Fetch quiz with all nested variants and items
- `createCompleteQuiz(quizData)` - Create quiz with variants and items in one call

## Component Integration

### Quiz Component (`src/components/Quiz.js`)
- Creates new quizzes via API
- Handles loading states and error messages
- Navigates to variants page with quiz data

### Variants Component (`src/components/Variants.js`)
- Creates variants for the selected quiz
- Validates input and handles API errors
- Navigates to items page with quiz and variants data

### Items Component (`src/components/Items.js`)
- Creates items for the selected variant
- Parses comma-separated item input
- Shows success message on completion

### Home Component (`src/components/Home.js`)
- Displays user's existing quizzes
- Handles quiz deletion
- Shows success/error messages
- Provides navigation to quiz creation

## Data Flow

1. **Quiz Creation**: User enters quiz title → API creates quiz → Navigate to variants
2. **Variant Creation**: User adds variants → API creates variants → Navigate to items
3. **Item Creation**: User selects variant and adds items → API creates items → Show success message
4. **Quiz Management**: Home page loads existing quizzes → User can view or delete quizzes

## Error Handling

- All API calls include try-catch blocks
- User-friendly error messages displayed
- Loading states during API operations
- Automatic token refresh on 401 errors
- Redirect to login on authentication failure

## Authentication

- JWT tokens stored in localStorage
- Automatic token refresh on expiration
- Bearer token included in all API requests
- Logout clears tokens and redirects to login

## Usage Examples

### Creating a Quiz
```javascript
const quizData = { title: "My Quiz" };
const quiz = await quizService.createQuiz(quizData);
```

### Creating Variants
```javascript
const variantData = { name: "Option A", quiz: quizId };
const variant = await quizService.createVariant(variantData);
```

### Creating Items
```javascript
const itemData = { name: "Question 1", variant: variantId };
const item = await quizService.createItem(itemData);
```

### Loading Complete Quiz
```javascript
const completeQuiz = await quizService.getCompleteQuiz(quizId);
// Returns quiz with nested variants and items
```

## Configuration

The API configuration is managed in `src/config/api.js`:
- Base URL can be set via environment variable `REACT_APP_API_BASE_URL`
- Default base URL: `http://127.0.0.1:8000/api`
- Token keys can be customized via environment variables
