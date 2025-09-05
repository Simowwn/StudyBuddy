import API_CONFIG from '../config/api';
import authService from './authService';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = authService.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Handle API responses
  async handleResponse(response, originalData = null) {
    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await authService.refreshToken();
        // Retry the original request with new token
        return this.retryRequest(response.url, response.method, originalData);
      } catch (error) {
        // Refresh failed, redirect to login
        authService.logout();
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // No Content
    if (response.status === 204) {
      return null;
    }

    // Gracefully handle empty or non-JSON bodies
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const text = await response.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch (_e) {
        // Fallback in case server sends invalid JSON with 2xx
        return null;
      }
    } else {
      const text = await response.text();
      return text || null;
    }
  }

  // Retry request with new token
  async retryRequest(url, method, originalData = null) {
    const requestOptions = {
      method,
      headers: this.getHeaders(),
    };

    // Only add body for non-GET/HEAD requests
    if (method !== 'GET' && method !== 'HEAD' && originalData) {
      requestOptions.body = JSON.stringify(originalData);
    }

    const response = await fetch(url, requestOptions);
    return this.handleResponse(response, originalData);
  }

  // Generic API methods
  async get(endpoint, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(includeAuth),
      });
      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint, data, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response, data);
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response, data);
    } catch (error) {
      throw error;
    }
  }

  async patch(endpoint, data, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(includeAuth),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response, data);
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint, includeAuth = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(includeAuth),
      });
      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }
}

export default new ApiService();
