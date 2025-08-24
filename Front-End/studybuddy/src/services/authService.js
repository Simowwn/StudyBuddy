import API_CONFIG from '../config/api';

class AuthService {
  // Token management
  setTokens(accessToken, refreshToken) {
    localStorage.setItem(API_CONFIG.TOKEN_KEYS.ACCESS, accessToken);
    localStorage.setItem(API_CONFIG.TOKEN_KEYS.REFRESH, refreshToken);
  }

  getAccessToken() {
    return localStorage.getItem(API_CONFIG.TOKEN_KEYS.ACCESS);
  }

  getRefreshToken() {
    return localStorage.getItem(API_CONFIG.TOKEN_KEYS.REFRESH);
  }

  clearTokens() {
    localStorage.removeItem(API_CONFIG.TOKEN_KEYS.ACCESS);
    localStorage.removeItem(API_CONFIG.TOKEN_KEYS.REFRESH);
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // API calls
  async login(credentials) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      this.setTokens(data.access, data.refresh);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOKEN_REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data.access, refreshToken);
      return data.access;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  logout() {
    this.clearTokens();
  }
}

export default new AuthService();
