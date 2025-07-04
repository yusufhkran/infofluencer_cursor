// Dashboard.js - Modern Infofluencer Dashboard with Auto Data Fetching
// Bu dosya /src/pages/Dashboard.js olacak

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// API fonksiyonları
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Token utilities
const tokenUtils = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  getUserData: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

// Dashboard API fonksiyonları
const dashboardApi = {
  // YouTube Authentication
  startYouTubeAuth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/auth/youtube/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to start YouTube auth' };
      }
    } catch (error) {
      console.error('YouTube auth error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  // GA4 Authentication
  startGA4Auth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/auth/ga4/start/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to start GA4 auth' };
      }
    } catch (error) {
      console.error('GA4 auth error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  // Save GA4 Property ID - Otomatik veri çekme ile
  saveGA4PropertyId: async (propertyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/auth/ga4/property/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ property_id: propertyId })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { 
          success: true, 
          data: data,
          message: data.message || 'Property ID saved and data fetch started!'
        };
      } else {
        return { success: false, message: data.error || 'Failed to save property ID' };
      }
    } catch (error) {
      console.error('Save property ID error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  // Dashboard API endpoints
  getAnalyticsOverview: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/dashboard/overview/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to get analytics overview' };
      }
    } catch (error) {
      console.error('Analytics overview error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  getAudienceInsights: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/dashboard/audience/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to get audience insights' };
      }
    } catch (error) {
      console.error('Audience insights error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  getTrafficAnalysis: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/dashboard/traffic/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to get traffic analysis' };
      }
    } catch (error) {
      console.error('Traffic analysis error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  // Manuel veri çekme (fallback)
  fetchAllData: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/reports/fetch-all/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to fetch data' };
      }
    } catch (error) {
      console.error('Data fetch error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  // ESKİ FONKSİYONLAR (Geriye dönük uyumluluk için)
  runGA4Report: async (reportType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/reports/ga4/run/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report_type: reportType })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to run GA4 report' };
      }
    } catch (error) {
      console.error('GA4 report error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  runYouTubeReport: async (reportType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/reports/youtube/run/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report_type: reportType })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to run YouTube report' };
      }
    } catch (error) {
      console.error('YouTube report error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  getGA4Data: async (reportType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/reports/saved/?source=ga4&report_type=${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'No data found' };
      }
    } catch (error) {
      console.error('Get GA4 data error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  getYouTubeData: async (reportType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/reports/saved/?source=youtube&report_type=${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'No data found' };
      }
    } catch (error) {
      console.error('Get YouTube data error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  checkConnections: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/company/analytics/connections/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenUtils.getAccessToken()}`,
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, message: data.error || 'Failed to check connections' };
      }
    } catch (error) {
      console.error('Connection check error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState({ ga4: false, youtube: false });
  const [ga4PropertySet, setGA4PropertySet] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [ga4PropertyId, setGA4PropertyId] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Dashboard verileri için
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    audience: null,
    traffic: null
  });
  const [dataFetchInProgress, setDataFetchInProgress] = useState(false);
  const [hasAnalyticsData, setHasAnalyticsData] = useState(false);

  // Report types
  const GA4_REPORTS = [
    { key: 'userAcquisitionSource', name: 'User Acquisition', icon: '👥' },
    { key: 'sessionSourceMedium', name: 'Session Source', icon: '🌐' },
    { key: 'operatingSystem', name: 'Operating System', icon: '💻' },
    { key: 'userGender', name: 'User Gender', icon: '👤' },
    { key: 'deviceCategory', name: 'Device Category', icon: '📱' },
    { key: 'country', name: 'Country', icon: '🌍' },
    { key: 'city', name: 'City', icon: '🏙️' },
    { key: 'age', name: 'Age Demographics', icon: '📊' }
  ];

  const YOUTUBE_REPORTS = [
    { key: 'trafficSource', name: 'Traffic Source', icon: '🚀' },
    { key: 'ageGroup', name: 'Age Groups', icon: '👥' },
    { key: 'deviceType', name: 'Device Types', icon: '📺' },
    { key: 'topSubscribers', name: 'Top Subscribers', icon: '⭐' }
  ];

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    checkConnections();
    
    // URL'den mesaj parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ga4_connected') === 'true') {
      showMessage('GA4 successfully connected! Please set your Property ID to start data collection.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get('youtube_connected') === 'true') {
      showMessage('YouTube successfully connected!', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get('error')) {
      showMessage('Authentication failed. Please try again.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Paralel olarak tüm dashboard verilerini çek
      const [overviewResult, audienceResult, trafficResult] = await Promise.all([
        dashboardApi.getAnalyticsOverview(),
        dashboardApi.getAudienceInsights(),
        dashboardApi.getTrafficAnalysis()
      ]);

      const newDashboardData = {
        overview: overviewResult.success ? overviewResult.data : null,
        audience: audienceResult.success ? audienceResult.data : null,
        traffic: trafficResult.success ? trafficResult.data : null
      };

      setDashboardData(newDashboardData);
      
      // Herhangi bir veri var mı kontrol et
      const hasData = newDashboardData.overview || newDashboardData.audience || newDashboardData.traffic;
      setHasAnalyticsData(hasData);

      if (!hasData) {
        showMessage('No analytics data found. Data might still be processing or you may need to fetch data manually.', 'info');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showMessage('Error loading dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dashboard verilerini yükle
  useEffect(() => {
    if (ga4PropertySet) {
      loadDashboardData();
    }
  }, [ga4PropertySet, loadDashboardData]);

  const checkConnections = async () => {
    try {
      const result = await dashboardApi.checkConnections();
      if (result.success) {
        setConnections(result.data.connections);
        
        // GA4 Property ID durumunu kontrol et
        if (result.data.ga4_property_id) {
          setGA4PropertyId(result.data.ga4_property_id);
          setGA4PropertySet(true);
        } else {
          setGA4PropertyId('');
          setGA4PropertySet(false);
        }
        
        console.log('🔍 Connection Status:', result.data);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleGA4Connect = async () => {
    try {
      setIsLoading(true);
      const result = await dashboardApi.startGA4Auth();
      if (result.success && result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        showMessage('Failed to start authentication', 'error');
      }
    } catch (error) {
      showMessage('Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTubeConnect = async () => {
    try {
      setIsLoading(true);
      const result = await dashboardApi.startYouTubeAuth();
      if (result.success && result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        showMessage('Failed to start authentication', 'error');
      }
    } catch (error) {
      showMessage('Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Save Property ID - Otomatik veri çekme ile
  const savePropertyId = async () => {
    if (!ga4PropertyId.trim()) {
      showMessage('Please enter a valid Property ID', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setDataFetchInProgress(true);
      
      const result = await dashboardApi.saveGA4PropertyId(ga4PropertyId);
      if (result.success) {
        showMessage('Property ID saved! 🚀 Automatically fetching all your analytics data...', 'success');
        setGA4PropertySet(true);
        
        // 5 saniye sonra dashboard verilerini yükle
        setTimeout(() => {
          loadDashboardData();
          setDataFetchInProgress(false);
        }, 5000);
        
        // Connections'ı yeniden kontrol et
        setTimeout(checkConnections, 1000);
      } else {
        showMessage(result.message || 'Failed to save Property ID', 'error');
        setDataFetchInProgress(false);
      }
    } catch (error) {
      showMessage('Failed to save Property ID', 'error');
      setDataFetchInProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Manuel veri çekme fonksiyonu
  const handleManualDataFetch = async () => {
    try {
      setIsLoading(true);
      setDataFetchInProgress(true);
      
      const result = await dashboardApi.fetchAllData();
      if (result.success) {
        showMessage(`Data fetch completed! ${result.data.successful_reports} reports fetched successfully.`, 'success');
        setTimeout(() => {
          loadDashboardData();
          setDataFetchInProgress(false);
        }, 2000);
      } else {
        showMessage(result.message || 'Failed to fetch data', 'error');
        setDataFetchInProgress(false);
      }
    } catch (error) {
      showMessage('Failed to fetch data', 'error');
      setDataFetchInProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics Dashboard'a yönlendirme
  const goToAnalyticsDashboard = () => {
    navigate('/analytics');
  };

  // Property ID'yi backend'den güncellemek için
  // eslint-disable-next-line no-unused-vars
  const savePropertyIdBackend = async (propertyId) => {
    try {
      await dashboardApi.saveGA4PropertyId(propertyId || '');
      setTimeout(checkConnections, 500);
    } catch (error) {
      console.error('Error updating property ID:', error);
    }
  };

  // ESKİ FONKSİYONLAR (Manuel rapor çekme için)
  const runReport = async (source, reportType) => {
    try {
      setIsLoading(true);
      
      let result;
      if (source === 'ga4') {
        result = await dashboardApi.runGA4Report(reportType);
      } else {
        result = await dashboardApi.runYouTubeReport(reportType);
      }

      if (result.success) {
        showMessage(`${reportType} report generated successfully!`, 'success');
        setTimeout(() => loadSavedReport(source, reportType), 1000);
      } else {
        showMessage(result.message || 'Failed to run report', 'error');
      }
    } catch (error) {
      showMessage('Failed to run report', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedReport = async (source, reportType) => {
    try {
      setIsLoading(true);
      
      let result;
      if (source === 'ga4') {
        result = await dashboardApi.getGA4Data(reportType);
      } else {
        result = await dashboardApi.getYouTubeData(reportType);
      }

      if (result.success && result.data.data) {
        setSelectedReport({ 
          source, 
          reportType, 
          data: result.data.data,
          recordCount: result.data.record_count 
        });
        setActiveSection('reports');
        showMessage(`Loaded ${result.data.record_count} records`, 'success');
      } else {
        showMessage('No saved data found for this report', 'error');
        setSelectedReport(null);
      }
    } catch (error) {
      showMessage('No saved data found', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  };

  // Yardımcı fonksiyonlar
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                  Infofluencer
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.email
                      }
                    </p>
                  </div>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="text-orange-600 hover:text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message && (
        <div className={`mx-4 mt-4 p-4 rounded-xl border ${
          messageType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700'
            : messageType === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Data Fetch Progress */}
      {dataFetchInProgress && (
        <div className="mx-4 mt-4 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <h3 className="font-semibold text-blue-900">Fetching Your Analytics Data</h3>
          </div>
          <p className="text-blue-700 text-sm mb-3">
            We're automatically collecting all your GA4 data including:
          </p>
          <ul className="text-sm text-blue-600 grid grid-cols-2 gap-2">
            <li>• User acquisition sources</li>
            <li>• Geographic data</li>
            <li>• Device categories</li>
            <li>• Age demographics</li>
            <li>• Session sources</li>
            <li>• Operating systems</li>
            <li>• Traffic analysis</li>
            <li>• Engagement metrics</li>
          </ul>
          <p className="text-blue-700 text-sm mt-3">
            This will take a few moments. You can refresh the page or wait for automatic updates.
          </p>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-center">Loading...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Manage your influencer campaigns and analytics from one place
          </p>
        </div>

        {/* Navigation Pills */}
        <div className="flex space-x-2 mb-8 bg-white/70 backdrop-blur-sm p-2 rounded-2xl border border-white/50">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'analytics-dashboard', label: 'Analytics Dashboard', icon: '🚀' },
            { id: 'ga4', label: 'GA4 Setup', icon: '📈' },
            { id: 'youtube', label: 'YouTube Setup', icon: '📺' },
            { id: 'reports', label: 'Manual Reports', icon: '📋' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => section.id === 'analytics-dashboard' ? goToAnalyticsDashboard() : setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Analytics Data Preview */}
            {hasAnalyticsData && dashboardData.overview && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">📊 Your Analytics at a Glance</h3>
                    <p className="text-blue-700">Latest data from your connected GA4 property</p>
                  </div>
                  <button
                    onClick={goToAnalyticsDashboard}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Full Dashboard
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.overview?.total_users)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(dashboardData.overview.overview?.total_sessions)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-600">Engagement Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.overview?.avg_engagement_rate}%</p>
                  </div>
                </div>
                
                {dashboardData.overview.overview?.data_last_updated && (
                  <p className="text-xs text-blue-600 mt-3">
                    Last updated: {formatDate(dashboardData.overview.overview.data_last_updated)}
                  </p>
                )}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-green-600">+3 this month</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Influencers</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                    <p className="text-sm text-green-600">+6 this week</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reach</p>
                    <p className="text-3xl font-bold text-gray-900">2.4M</p>
                    <p className="text-sm text-green-600">+12% growth</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI</p>
                    <p className="text-3xl font-bold text-gray-900">340%</p>
                    <p className="text-sm text-green-600">Above average</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="group flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <span className="font-medium text-gray-700">Find Influencers</span>
                </button>

                <button 
                  onClick={goToAnalyticsDashboard}
                  className="group flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">📊</span>
                  </div>
                  <span className="font-medium text-gray-700">Analytics Dashboard</span>
                </button>

                <button 
                  onClick={() => setActiveSection('youtube')}
                  className="group flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">📺</span>
                  </div>
                  <span className="font-medium text-gray-700">YouTube Setup</span>
                </button>

                <button className="group flex flex-col items-center p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-2xl">💬</span>
                  </div>
                  <span className="font-medium text-gray-700">Messages</span>
                </button>
              </div>
            </div>

            {/* Analytics Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                    Google Analytics 4
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    connections.ga4 && ga4PropertySet
                      ? 'bg-green-100 text-green-700' 
                      : connections.ga4
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {connections.ga4 && ga4PropertySet ? '✅ Ready' : connections.ga4 ? '⚙️ Setup Needed' : '❌ Not Connected'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">Track website performance and user behavior</p>
                
                {!connections.ga4 ? (
                  <button
                    onClick={() => setActiveSection('ga4')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-200"
                  >
                    Connect Google Analytics
                  </button>
                ) : !ga4PropertySet ? (
                  <button
                    onClick={() => setActiveSection('ga4')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg shadow-yellow-200"
                  >
                    Complete Setup
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={goToAnalyticsDashboard}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg shadow-green-200"
                    >
                      View Analytics Dashboard
                    </button>
                    {!hasAnalyticsData && (
                      <button
                        onClick={handleManualDataFetch}
                        className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-all duration-200 text-sm"
                      >
                        Fetch Data Manually
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                    YouTube Analytics
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    connections.youtube 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {connections.youtube ? '✅ Connected' : '❌ Not Connected'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">Monitor video performance and audience insights</p>
                {!connections.youtube && (
                  <button
                    onClick={() => setActiveSection('youtube')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-200"
                  >
                    Connect YouTube Analytics
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GA4 Section */}
        {activeSection === 'ga4' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                Google Analytics 4 Setup
              </h3>
              
              {!connections.ga4 ? (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📊</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Connect Google Analytics</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get detailed insights about your website visitors, their behavior, and conversion patterns
                  </p>
                  <button
                    onClick={handleGA4Connect}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Google Analytics'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">✅</span>
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Google Analytics Connected</p>
                        <p className="text-sm text-green-600">Ready to configure property</p>
                      </div>
                    </div>
                  </div>

                  {/* GA4 Property ID Section */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">GA4 Property Configuration</h4>
                    
                    {!ga4PropertySet ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GA4 Property ID <span className="text-red-500">*</span>
                          </label>
                          <div className="flex space-x-3">
                            <input
                              type="text"
                              value={ga4PropertyId}
                              onChange={(e) => setGA4PropertyId(e.target.value)}
                              placeholder="Enter your GA4 Property ID (e.g., 123456789)"
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              disabled={dataFetchInProgress}
                            />
                            <button
                              onClick={savePropertyId}
                              disabled={isLoading || !ga4PropertyId.trim() || dataFetchInProgress}
                              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                            >
                              {dataFetchInProgress ? 'Processing...' : isLoading ? 'Saving...' : 'Save & Fetch Data'}
                            </button>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-blue-700">
                            <strong>How to find your GA4 Property ID:</strong><br/>
                            1. Go to Google Analytics → Admin → Property Settings<br/>
                            2. Copy the Property ID (numbers only)<br/>
                            3. When you save it, we'll automatically fetch all your analytics data!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                          <div>
                            <p className="font-medium text-green-900">Property ID Configured</p>
                            <p className="text-sm text-green-600">Property ID: {ga4PropertyId}</p>
                          </div>
                          <button
                            onClick={() => {
                              setGA4PropertySet(false);
                              setGA4PropertyId('');
                              setHasAnalyticsData(false);
                              savePropertyIdBackend('');
                            }}
                            className="text-orange-600 hover:text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-50 transition-all duration-200 text-sm"
                          >
                            Change
                          </button>
                        </div>

                        {/* Analytics Dashboard Access */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                          <h4 className="text-lg font-bold text-green-900 mb-3">🎉 Analytics Ready!</h4>
                          <p className="text-green-700 mb-4">
                            Your GA4 is configured and data has been automatically collected. 
                            View your comprehensive analytics dashboard with all insights.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              onClick={goToAnalyticsDashboard}
                              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-200 shadow-lg shadow-green-200"
                            >
                              🚀 View Analytics Dashboard
                            </button>
                            {!hasAnalyticsData && (
                              <button
                                onClick={handleManualDataFetch}
                                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-all duration-200"
                              >
                                Refresh Data
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual Reports - Legacy */}
                  {ga4PropertySet && (
                    <details className="bg-gray-50 rounded-xl">
                      <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                        🔧 Advanced: Manual Report Generation
                      </summary>
                      <div className="p-4 pt-0">
                        <p className="text-sm text-gray-600 mb-4">
                          Use these options for manual report generation if needed. The analytics dashboard above provides all data automatically.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {GA4_REPORTS.map((report) => (
                            <div key={report.key} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{report.icon}</span>
                                  <h5 className="font-medium text-gray-900">{report.name}</h5>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <button
                                  onClick={() => runReport('ga4', report.key)}
                                  disabled={isLoading}
                                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 text-sm"
                                >
                                  {isLoading ? 'Running...' : 'Run Report'}
                                </button>
                                <button
                                  onClick={() => loadSavedReport('ga4', report.key)}
                                  disabled={isLoading}
                                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm"
                                >
                                  Load Saved
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* YouTube Section */}
        {activeSection === 'youtube' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                YouTube Analytics Integration
              </h3>
              
              {!connections.youtube ? (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📺</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Connect YouTube Analytics</h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Access detailed insights about your YouTube channel performance, audience demographics, and video metrics
                  </p>
                  <button
                    onClick={handleYouTubeConnect}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-200 disabled:opacity-50"
                  >
                    {isLoading ? 'Connecting...' : 'Connect YouTube Analytics'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600">✅</span>
                      </div>
                      <div>
                        <p className="font-medium text-green-900">YouTube Analytics Connected</p>
                        <p className="text-sm text-green-600">Ready to fetch YouTube data</p>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Reports */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {YOUTUBE_REPORTS.map((report) => (
                        <div key={report.key} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{report.icon}</span>
                              <h5 className="font-medium text-gray-900">{report.name}</h5>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() => runReport('youtube', report.key)}
                              disabled={isLoading}
                              className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 text-sm"
                            >
                              {isLoading ? 'Running...' : 'Run Report'}
                            </button>
                            <button
                              onClick={() => loadSavedReport('youtube', report.key)}
                              disabled={isLoading}
                              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm"
                            >
                              Load Saved
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === 'reports' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="text-2xl mr-3">📋</span>
                Manual Reports & Raw Data
              </h3>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-blue-700 text-sm">
                  <strong>💡 Tip:</strong> For comprehensive analytics with automatic data collection, 
                  use the <button onClick={goToAnalyticsDashboard} className="underline font-medium">Analytics Dashboard</button> instead. 
                  This section is for manual report generation and raw data access.
                </p>
              </div>
              
              {selectedReport ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">
                        {`${selectedReport.source === 'ga4' ? 'Google Analytics 4' : 'YouTube Analytics'} - ${selectedReport.reportType}`}
                      </h4>
                      <p className="text-gray-600">
                        {selectedReport.recordCount} records found
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      Clear Report
                    </button>
                  </div>

                  {/* Data Display */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {selectedReport.data.length > 0 && 
                            Object.keys(selectedReport.data[0]).map((key) => (
                              <th key={key} className="text-left py-3 px-4 font-medium text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </th>
                            ))
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReport.data.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="py-3 px-4 text-gray-900">
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {selectedReport.data.length > 10 && (
                      <div className="mt-4 text-center text-gray-600">
                        Showing first 10 of {selectedReport.recordCount} records
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📋</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Selected</h3>
                  <p className="text-gray-600 mb-6">
                    Generate or load a report from GA4 or YouTube Analytics to view data here
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setActiveSection('ga4')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                      Go to GA4
                    </button>
                    <button
                      onClick={() => setActiveSection('youtube')}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    >
                      Go to YouTube
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Report Generation Grid */}
              {(connections.ga4 || connections.youtube) && (
                <div className="mt-8 space-y-6">
                  {/* GA4 Reports */}
                  {connections.ga4 && ga4PropertySet && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                        GA4 Reports
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {GA4_REPORTS.map((report) => (
                          <div key={report.key} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{report.icon}</span>
                                <h5 className="font-medium text-gray-900">{report.name}</h5>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <button
                                onClick={() => runReport('ga4', report.key)}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 text-sm"
                              >
                                {isLoading ? 'Running...' : 'Run Report'}
                              </button>
                              <button
                                onClick={() => loadSavedReport('ga4', report.key)}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm"
                              >
                                Load Saved
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YouTube Reports */}
                  {connections.youtube && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
                        YouTube Reports
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {YOUTUBE_REPORTS.map((report) => (
                          <div key={report.key} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{report.icon}</span>
                                <h5 className="font-medium text-gray-900">{report.name}</h5>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <button
                                onClick={() => runReport('youtube', report.key)}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 text-sm"
                              >
                                {isLoading ? 'Running...' : 'Run Report'}
                              </button>
                              <button
                                onClick={() => loadSavedReport('youtube', report.key)}
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 text-sm"
                              >
                                Load Saved
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h4>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleManualDataFetch}
                        disabled={isLoading || dataFetchInProgress}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                      >
                        {dataFetchInProgress ? 'Fetching All Data...' : 'Fetch All Available Data'}
                      </button>
                      <button
                        onClick={goToAnalyticsDashboard}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
                      >
                        View Analytics Dashboard
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Use "Fetch All Available Data" to manually refresh all reports, or go to the Analytics Dashboard for a comprehensive view.
                    </p>
                  </div>
                </div>
              )}

              {/* Connection Required Message */}
              {!connections.ga4 && !connections.youtube && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔌</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Analytics Connected</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your GA4 or YouTube Analytics to start generating reports
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setActiveSection('ga4')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                      Connect GA4
                    </button>
                    <button
                      onClick={() => setActiveSection('youtube')}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    >
                      Connect YouTube
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">I</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                Infofluencer
              </span>
            </div>
            <p className="text-gray-600">
              Empowering brands with data-driven influencer marketing
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;