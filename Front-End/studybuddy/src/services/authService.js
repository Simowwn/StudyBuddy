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
      console.log('Attempting login with:', { username: credentials.username });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Invalid username or password. Please check your credentials.');
        } else if (response.status === 400) {
          const message = errorData.message || errorData.non_field_errors?.[0] || 'Invalid input data';
          throw new Error(message);
        } else {
          throw new Error(errorData.message || `Login failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Login successful, received data:', { username: data.username, hasAccess: !!data.access, hasRefresh: !!data.refresh });
      
      if (!data.access || !data.refresh) {
        throw new Error('Invalid response from server: missing tokens');
      }
      
      this.setTokens(data.access, data.refresh);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      console.log('Attempting registration with:', { username: userData.username });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Registration error response:', errorData);
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.username) {
            throw new Error(`Username error: ${errorData.username.join(', ')}`);
          } else if (errorData.password) {
            throw new Error(`Password error: ${errorData.password.join(', ')}`);
          } else {
            const message = errorData.message || 'Invalid registration data';
            throw new Error(message);
          }
        } else {
          throw new Error(errorData.message || `Registration failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
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
