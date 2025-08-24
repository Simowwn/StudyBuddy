# Study Buddy Frontend

A React-based frontend application for the Study Buddy learning platform.

## Features

- 🔐 JWT Authentication with automatic token refresh
- 🛡️ Protected routes with authentication guards
- 📱 Responsive design with modern UI
- 🔄 Automatic API error handling and retry logic
- 💾 Local storage for token persistence
- 🌍 Environment-based configuration

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
Create a `.env` file in the root directory with the following content:
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_TOKEN_KEY=studybuddy_token
REACT_APP_REFRESH_TOKEN_KEY=studybuddy_refresh_token
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth.css        # Authentication styles
│   ├── Login.js        # Login component
│   ├── Register.js     # Registration component
│   ├── ProtectedRoute.js # Route protection component
│   └── ...
├── context/            # React context providers
│   └── AuthContext.js  # Authentication context
├── services/           # API services
│   ├── apiService.js   # Generic API service
│   ├── authService.js  # Authentication service
│   └── quizService.js  # Quiz-specific API service
├── config/             # Configuration files
│   └── api.js         # API configuration
└── App.js             # Main application component
```

## Authentication Flow

1. **Login**: User enters credentials → API call to `/api/users/login/` → JWT tokens stored in localStorage
2. **Token Refresh**: Automatic token refresh on 401 responses → Retry original request
3. **Logout**: Clear tokens from localStorage → Redirect to login
4. **Protected Routes**: Check authentication status → Redirect to login if not authenticated

## API Integration

### Making Authenticated API Calls

```javascript
import apiService from '../services/apiService';

// GET request with authentication
const data = await apiService.get('/quizzes/');

// POST request with authentication
const newQuiz = await apiService.post('/quizzes/', quizData);

// PUT request with authentication
const updatedQuiz = await apiService.put('/quizzes/1/', updatedData);

// DELETE request with authentication
await apiService.delete('/quizzes/1/');
```

### Using Service Classes

```javascript
import quizService from '../services/quizService';

// Get all quizzes
const quizzes = await quizService.getQuizzes();

// Create a new quiz
const newQuiz = await quizService.createQuiz({
  title: 'My Quiz',
  description: 'Quiz description'
});
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `REACT_APP_TOKEN_KEY` | Local storage key for access token | `studybuddy_token` |
| `REACT_APP_REFRESH_TOKEN_KEY` | Local storage key for refresh token | `studybuddy_refresh_token` |

## Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## Backend Requirements

The frontend expects the following backend endpoints:

- `POST /api/users/login/` - User login
- `POST /api/users/register/` - User registration
- `POST /api/token/refresh/` - Token refresh
- `GET /api/quizzes/` - Get quizzes (protected)
- `POST /api/quizzes/` - Create quiz (protected)
- `PUT /api/quizzes/{id}/` - Update quiz (protected)
- `DELETE /api/quizzes/{id}/` - Delete quiz (protected)

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Secure token storage in localStorage
- CORS configuration for cross-origin requests
- Protected routes with authentication guards
- Automatic logout on authentication failure

## Error Handling

The application includes comprehensive error handling:

- Network errors with user-friendly messages
- Authentication errors with automatic redirect
- Form validation errors
- API error responses with detailed messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
