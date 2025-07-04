// infofluencer-frontend/src/pages/AnalyticsPage.js - GÜNCELLENMİŞ VERSİYON

import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';

const AnalyticsPage = () => {
  const [connections, setConnections] = useState({ ga4: false, youtube: false });
  const [ga4PropertyId, setGA4PropertyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dataFetchInProgress, setDataFetchInProgress] = useState(false);

  useEffect(() => {
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

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const checkConnections = async () => {
    try {
      setIsLoading(true);
      const result = await analyticsApi.checkConnections();
      if (result.success) {
        setConnections(result.data.connections);
        if (result.data.ga4_property_id) {
          setGA4PropertyId(result.data.ga4_property_id);
        }
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      console.error('Error checking connections:', error);
      showMessage('Error checking connections', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGA4Connect = async () => {
    try {
      setIsLoading(true);
      const result = await analyticsApi.startGA4Auth();
      if (result.success && result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        showMessage(result.message || 'Failed to start GA4 authentication', 'error');
      }
    } catch (error) {
      console.error('GA4 auth error:', error);
      showMessage('GA4 connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTubeConnect = async () => {
    try {
      setIsLoading(true);
      const result = await analyticsApi.startYouTubeAuth();
      if (result.success && result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        showMessage(result.message || 'Failed to start YouTube authentication', 'error');
      }
    } catch (error) {
      console.error('YouTube auth error:', error);
      showMessage('YouTube connection failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const savePropertyId = async () => {
    if (!ga4PropertyId.trim()) {
      showMessage('Please enter a valid Property ID', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setDataFetchInProgress(true);
      
      const result = await analyticsApi.saveGA4PropertyId(ga4PropertyId);
      if (result.success) {
        showMessage('Property ID saved! 🚀 Automatically fetching all your analytics data...', 'success');
        
        // 5 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          window.location.href = '/analytics-dashboard';
        }, 5000);
        
      } else {
        showMessage(result.message || 'Failed to save Property ID', 'error');
        setDataFetchInProgress(false);
      }
    } catch (error) {
      console.error('Error saving property ID:', error);
      showMessage('Failed to save Property ID', 'error');
      setDataFetchInProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    window.location.href = '/analytics-dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Integration</h1>
          <p className="text-gray-600">Connect your analytics accounts to get comprehensive insights</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Data Fetch Progress */}
        {dataFetchInProgress && (
          <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
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
              This will take a few moments. You'll be redirected to your dashboard automatically.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Analytics 4 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Google Analytics 4</h2>
                <p className="text-sm text-gray-600">Website analytics and insights</p>
              </div>
            </div>

            {connections.ga4 ? (
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-green-600 font-medium">✅ Connected</span>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ga4PropertyId}
                      onChange={(e) => setGA4PropertyId(e.target.value)}
                      placeholder="Enter GA4 Property ID (e.g., 123456789)"
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={dataFetchInProgress}
                    />
                    <button
                      onClick={savePropertyId}
                      disabled={isLoading || dataFetchInProgress}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {dataFetchInProgress ? 'Fetching...' : 'Save & Fetch Data'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in Google Analytics → Admin → Property Details
                  </p>
                </div>

                {ga4PropertyId && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">🎉 Ready for Analytics!</h3>
                    <p className="text-sm text-green-700 mb-3">
                      Your GA4 is connected and configured. When you save the Property ID, we'll automatically collect all your analytics data.
                    </p>
                    <button
                      onClick={goToDashboard}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      View Dashboard
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Connect your Google Analytics 4 account to access comprehensive website analytics.
                </p>
                <button
                  onClick={handleGA4Connect}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect GA4'}
                </button>
              </div>
            )}
          </div>

          {/* YouTube Analytics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🎥</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">YouTube Analytics</h2>
                <p className="text-sm text-gray-600">Video performance insights</p>
              </div>
            </div>

            {connections.youtube ? (
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-green-600 font-medium">✅ Connected</span>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">YouTube Ready!</h3>
                  <p className="text-sm text-green-700">
                    Your YouTube channel is connected and ready for analytics.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Connect your YouTube channel to track video performance and audience insights.
                </p>
                <button
                  onClick={handleYouTubeConnect}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connecting...' : 'Connect YouTube'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">1️⃣</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Connect Analytics</h4>
              <p className="text-sm text-gray-600">
                Connect your GA4 and YouTube accounts using the buttons above.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">2️⃣</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Set Property ID</h4>
              <p className="text-sm text-gray-600">
                Enter your GA4 Property ID to automatically fetch all your data.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">3️⃣</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">View Insights</h4>
              <p className="text-sm text-gray-600">
                Access your comprehensive analytics dashboard with all insights.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🚀 What happens after connecting?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All your analytics data is automatically collected</li>
              <li>• Data is organized into meaningful insights and tables</li>
              <li>• No need to manually generate individual reports</li>
              <li>• Real-time dashboard with audience, traffic, and performance metrics</li>
              <li>• Data updates automatically to keep insights current</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        {connections.ga4 && ga4PropertyId && (
          <div className="mt-8 text-center">
            <button
              onClick={goToDashboard}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              🚀 Go to Analytics Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;