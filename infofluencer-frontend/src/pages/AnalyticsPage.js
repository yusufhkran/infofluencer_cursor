import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';

const AnalyticsPage = () => {
  const [connections, setConnections] = useState({ ga4: false, youtube: false });
  const [ga4PropertyId, setGA4PropertyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Available report types
  const GA4_REPORTS = [
    { key: 'userAcquisitionSource', name: 'User Acquisition Source' },
    { key: 'sessionSourceMedium', name: 'Session Source Medium' },
    { key: 'operatingSystem', name: 'Operating System' },
    { key: 'userGender', name: 'User Gender' },
    { key: 'deviceCategory', name: 'Device Category' },
    { key: 'country', name: 'Country' },
    { key: 'city', name: 'City' },
    { key: 'age', name: 'Age' }
  ];

  const YOUTUBE_REPORTS = [
    { key: 'trafficSource', name: 'Traffic Source' },
    { key: 'ageGroup', name: 'Age Group' },
    { key: 'deviceType', name: 'Device Type' },
    { key: 'topSubscribers', name: 'Top Subscribers' }
  ];

  useEffect(() => {
    checkConnections();
    
    // URL'den mesaj parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('ga4_connected') === 'true') {
      showMessage('GA4 successfully connected!', 'success');
      // URL'yi temizle
      window.history.replaceState({}, document.title, window.location.pathname);
      // Connections'ı yeniden kontrol et
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
        // Redirect to Google OAuth
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
        // Redirect to Google OAuth
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
      const result = await analyticsApi.saveGA4PropertyId(ga4PropertyId);
      if (result.success) {
        showMessage('Property ID saved successfully!', 'success');
      } else {
        showMessage(result.message || 'Failed to save Property ID', 'error');
      }
    } catch (error) {
      console.error('Error saving property ID:', error);
      showMessage('Failed to save Property ID', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runReport = async (source, reportType) => {
    try {
      setIsLoading(true);
      
      let result;
      if (source === 'ga4') {
        result = await analyticsApi.runGA4Report(reportType);
      } else {
        result = await analyticsApi.runYouTubeReport(reportType);
      }

      if (result.success) {
        showMessage(`${reportType} report generated successfully! ${result.data.record_count} records`, 'success');
        // Automatically load the data after generating
        setTimeout(() => loadSavedReport(source, reportType), 1000);
      } else {
        showMessage(result.message || 'Failed to run report', 'error');
      }
    } catch (error) {
      console.error('Error running report:', error);
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
        result = await analyticsApi.getGA4Data(reportType);
      } else {
        result = await analyticsApi.getYouTubeData(reportType);
      }

      if (result.success && result.data.data) {
        setSelectedReport({ 
          source, 
          reportType, 
          data: result.data.data,
          recordCount: result.data.record_count 
        });
        showMessage(`Loaded ${result.data.record_count} records`, 'success');
      } else {
        showMessage('No saved data found for this report', 'error');
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Error loading saved report:', error);
      showMessage('No saved data found', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Integration</h1>

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

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* GA4 Connection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Google Analytics 4
            </h2>
            
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
                    />
                    <button
                      onClick={savePropertyId}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in Google Analytics → Admin → Property Details
                  </p>
                </div>

                {/* GA4 Reports */}
                {ga4PropertyId && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">Available Reports:</h3>
                    {GA4_REPORTS.map(report => (
                      <div key={report.key} className="flex gap-2">
                        <button
                          onClick={() => runReport('ga4', report.key)}
                          disabled={isLoading}
                          className="flex-1 text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Generate {report.name}
                        </button>
                        <button
                          onClick={() => loadSavedReport('ga4', report.key)}
                          disabled={isLoading}
                          className="px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Load
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Connect your Google Analytics 4 account to access analytics data.
                </p>
                <button
                  onClick={handleGA4Connect}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Connect GA4
                </button>
              </div>
            )}
          </div>

          {/* YouTube Connection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              YouTube Analytics
            </h2>
            
            {connections.youtube ? (
              <div>
                <div className="flex items-center mb-6">
                  <span className="text-green-600 font-medium">✅ Connected</span>
                </div>

                {/* YouTube Reports */}
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Available Reports:</h3>
                  {YOUTUBE_REPORTS.map(report => (
                    <div key={report.key} className="flex gap-2">
                      <button
                        onClick={() => runReport('youtube', report.key)}
                        disabled={isLoading}
                        className="flex-1 text-left px-3 py-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Generate {report.name}
                      </button>
                      <button
                        onClick={() => loadSavedReport('youtube', report.key)}
                        disabled={isLoading}
                        className="px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Connect your YouTube account to access YouTube Analytics data.
                </p>
                <button
                  onClick={handleYouTubeConnect}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Connect YouTube
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Report Display */}
        {selectedReport && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedReport.source.toUpperCase()} - {selectedReport.reportType}
              </h2>
              <span className="text-sm text-gray-500">
                {selectedReport.recordCount} records
              </span>
            </div>
            
            {selectedReport.data && selectedReport.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      {Object.keys(selectedReport.data[0]).map(key => (
                        <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.data.slice(0, 20).map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
                            {typeof value === 'number' ? value.toLocaleString() : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedReport.data.length > 20 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Showing first 20 of {selectedReport.data.length} records
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
        )}

        {/* Refresh Connection Button */}
        <div className="mt-8 text-center">
          <button
            onClick={checkConnections}
            disabled={isLoading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Refresh Connections
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;