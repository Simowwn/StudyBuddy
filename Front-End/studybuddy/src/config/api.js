// API Configuration
const resolvedEnvBaseUrl = (process.env.REACT_APP_API_BASE_URL || '').trim();
const isInvalidEnvBaseUrl =
  !resolvedEnvBaseUrl ||
  resolvedEnvBaseUrl.toLowerCase() === 'undefined' ||
  resolvedEnvBaseUrl.toLowerCase() === 'null';

const API_CONFIG = {
  BASE_URL: isInvalidEnvBaseUrl ? 'https://mindly-backend-yp3r.onrender.com/api' : resolvedEnvBaseUrl,
  ENDPOINTS: {
    LOGIN: '/users/login/',
    REGISTER: '/users/register/',
    TOKEN_REFRESH: '/token/refresh/',
    QUIZZES: '/quizzes/quizzes/',
    VARIANTS: '/quizzes/variants/',
    ITEMS: '/quizzes/items/',
    USERS: '/users/',
  },
  TOKEN_KEYS: {
    ACCESS: process.env.REACT_APP_TOKEN_KEY || 'studybuddy_token',
    REFRESH: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'studybuddy_refresh_token',
  }
};

export default API_CONFIG;
