// api.js: Backend API ile iletişim için kullanılan fonksiyonlar.

/**
 * API fonksiyonları, backend ile veri alışverişini merkezi olarak yönetir.
 * Her fonksiyon ilgili endpoint'e istek atar ve sonucu döner.
 */

// API base configuration
const API_BASE_URL = "http://localhost:8000";

// API endpoints
const ENDPOINTS = {
  LOGIN: "/api/auth/company_login/",
  REGISTER: "/api/auth/company_register/",
  REFRESH: "/api/auth/refresh/",
  USER_PROFILE: "/api/auth/profile/",
  LOGOUT: "/api/auth/logout/",
};

// Error message mapping for professional messages
const ERROR_MESSAGES = {
  "Invalid email or password":
    "The email or password you entered is incorrect. Please try again.",
  "This account is not a company account":
    "This account is registered as an influencer. Please use the influencer login.",
  "This account is not an influencer account":
    "This account is registered as a company. Please use the company login.",
  "User account is disabled":
    "Your account has been disabled. Please contact support for assistance.",
  "Invalid user type": "Please select a valid account type.",
  "A user with this email already exists.":
    "An account with this email address already exists. Please use a different email or try logging in.",
  "Password must be at least 8 characters long":
    "Your password must be at least 8 characters long.",
  "API request failed":
    "We're experiencing technical difficulties. Please try again in a moment.",
  "Network error occurred. Please try again.":
    "Unable to connect to our servers. Please check your internet connection and try again.",
  "Authentication failed": "Your session has expired. Please log in again.",
  "Failed to fetch user profile":
    "Unable to load your profile information. Please refresh the page.",
};

// Token management utilities
export const tokenUtils = {
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },
};

// HTTP request wrapper with automatic token handling
class ApiService {
  // Helper method to get user-friendly error messages
  getUserFriendlyError(error, isRegister = false) {
    const errorMessage = error.message || "An unexpected error occurred";

    // Handle validation errors with field-specific messages
    if (typeof errorMessage === "object") {
      if (errorMessage.email) {
        return errorMessage.email;
      }
      if (errorMessage.password) {
        return errorMessage.password;
      }
      if (errorMessage.non_field_errors) {
        return errorMessage.non_field_errors[0];
      }
    }

    return ERROR_MESSAGES[errorMessage] || errorMessage;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = tokenUtils.getAccessToken();

    // Default headers
    const headers = {
      "Content-Type": "application/json",
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
          window.location.href = "/login";
          throw new Error("Authentication failed");
        }
      }

      const data = await response.json();

      if (!response.ok) {
        // Handle different types of error responses
        let errorMessage = "API request failed";

        if (data.email && Array.isArray(data.email)) {
          errorMessage = data.email[0];
        } else if (data.password && Array.isArray(data.password)) {
          errorMessage = data.password[0];
        } else if (
          data.non_field_errors &&
          Array.isArray(data.non_field_errors)
        ) {
          errorMessage = data.non_field_errors[0];
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (typeof data === "object") {
          // Handle field-specific errors
          const firstErrorField = Object.keys(data)[0];
          if (firstErrorField && Array.isArray(data[firstErrorField])) {
            errorMessage = data[firstErrorField][0];
          }
        }

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("API request error:", error);

      // Handle network errors
      if (!navigator.onLine) {
        throw new Error("Network error occurred. Please try again.");
      }

      throw error;
    }
  }

  // Authentication methods
  async login(email, password, userType = "company") {
    try {
      const response = await this.request(ENDPOINTS.LOGIN, {
        method: "POST",
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
          localStorage.setItem("user_data", JSON.stringify(response.user));
        }

        return {
          success: true,
          data: response,
          message: "Login successful",
        };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      return {
        success: false,
        message: this.getUserFriendlyError(error),
      };
    }
  }

  async register(userData) {
    try {
      const response = await this.request(ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.company,
          userType: userData.userType || "company",
        }),
      });

      return {
        success: true,
        data: response,
        message:
          "Your account has been created successfully! Please log in to continue.",
      };
    } catch (error) {
      return {
        success: false,
        message: this.getUserFriendlyError(error),
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          localStorage.setItem("access_token", data.access);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  async logout() {
    try {
      const refreshToken = tokenUtils.getRefreshToken();

      if (refreshToken) {
        // Try to blacklist the refresh token on server
        await this.request(ENDPOINTS.LOGOUT, {
          method: "POST",
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local tokens
      tokenUtils.clearTokens();
    }
  }

  async getUserProfile() {
    try {
      const response = await this.request(ENDPOINTS.USER_PROFILE, {
        method: "GET",
      });

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: this.getUserFriendlyError(error),
      };
    }
  }

  // Helper method to check if user is authenticated
  isAuthenticated() {
    return tokenUtils.isAuthenticated();
  }

  // Get current user data from localStorage
  getCurrentUser() {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }
}
// Mevcut api.js dosyasının sonuna ekle

// Analytics API methods
const analyticsApi = {
  // Connection status
  checkConnections: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/analytics/connections/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to check connections",
        };
      }
    } catch (error) {
      console.error("Connection check error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  // GA4 Authentication
  startGA4Auth: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/auth/ga4/start/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to start GA4 auth",
        };
      }
    } catch (error) {
      console.error("GA4 auth error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  saveGA4PropertyId: async (propertyId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/auth/ga4/property/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ property_id: propertyId }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to save property ID",
        };
      }
    } catch (error) {
      console.error("Save property ID error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  // YouTube Authentication
  startYouTubeAuth: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/auth/youtube/start/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to start YouTube auth",
        };
      }
    } catch (error) {
      console.error("YouTube auth error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  // GA4 Reports
  runGA4Report: async (reportType) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/reports/ga4/run/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report_type: reportType }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to run GA4 report",
        };
      }
    } catch (error) {
      console.error("GA4 report error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  getGA4Data: async (reportType) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/reports/saved/?source=ga4&report_type=${reportType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || "No data found" };
      }
    } catch (error) {
      console.error("Get GA4 data error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  // YouTube Reports
  runYouTubeReport: async (reportType) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/reports/youtube/run/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report_type: reportType }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to run YouTube report",
        };
      }
    } catch (error) {
      console.error("YouTube report error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  getYouTubeData: async (reportType) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/company/reports/saved/?source=youtube&report_type=${reportType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || "No data found" };
      }
    } catch (error) {
      console.error("Get YouTube data error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },

  // Analytics Dashboard
  getAnalyticsDashboard: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/analytics/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return {
          success: false,
          message: data.error || "Failed to load analytics dashboard",
        };
      }
    } catch (error) {
      console.error("Analytics dashboard error:", error);
      return { success: false, message: "Network error occurred" };
    }
  },
};

// Export analytics API
export { analyticsApi };

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

export async function apiCall(url, options = {}) {
  const token = localStorage.getItem("access_token");
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401 || response.status === 403) {
    // Token geçersiz veya süresi dolmuş, logout et
      localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    if (typeof window !== 'undefined') {
      window.location.href = "/login";
    }
    return;
    }
    return await response.json();
}
