// API base configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// API endpoints
const ENDPOINTS = {
  LOGIN: '/api/auth/login/',
  REGISTER: '/api/auth/register/',
  REFRESH: '/api/auth/token/refresh/',
  USER_PROFILE: '/api/auth/user/',
  LOGOUT: '/api/auth/logout/',
};

// Token management utilities
export const tokenUtils = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};

// HTTP request wrapper with automatic token handling
class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenUtils.getAccessToken();
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      let response = await fetch(url, config);

      // Handle token refresh if access token expired
      if (response.status === 401 && token) {
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${tokenUtils.getAccessToken()}`;
          response = await fetch(url, { ...config, headers });
        } else {
          // Refresh failed, redirect to login
          tokenUtils.clearTokens();
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password, userType = 'company') {
    try {
      const response = await this.request(ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          user_type: userType,
        }),
      });

      if (response.access && response.refresh) {
        tokenUtils.setTokens(response.access, response.refresh);
        
        // Store user data if provided
        if (response.user) {
          localStorage.setItem('user_data', JSON.stringify(response.user));
        }

        return {
          success: true,
          data: response,
          message: 'Login successful'
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  async register(userData) {
    try {
      const response = await this.request(ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName,
          company: userData.company,
          user_type: userData.userType || 'company',
        }),
      });

      return {
        success: true,
        data: response,
        message: 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  }

  async refreshToken() {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          localStorage.setItem('access_token', data.access);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async logout() {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      
      if (refreshToken) {
        // Try to blacklist the refresh token on server
        await this.request(ENDPOINTS.LOGOUT, {
          method: 'POST',
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local tokens
      tokenUtils.clearTokens();
    }
  }

  async getUserProfile() {
    try {
      const response = await this.request(ENDPOINTS.USER_PROFILE, {
        method: 'GET',
      });

      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch user profile'
      };
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return tokenUtils.isAuthenticated();
  }

  // Get current user data from localStorage
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;