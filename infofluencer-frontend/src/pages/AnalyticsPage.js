// infofluencer-frontend/src/pages/AnalyticsPage.js - GÜNCELLENMİŞ VERSİYON

// AnalyticsPage.js: Analytics ile ilgili detaylı verilerin gösterildiği sayfa.

/**
 * AnalyticsPage, kitle, trafik ve cihaz analizlerini alt sekmelerde gösterir.
 * GA4 ve YouTube verilerinin harmanlandığı, kullanıcıya bilgi kutusu ile sunulan ana analytics ekranıdır.
 */

import React, { useState, useEffect } from "react";
import {
  checkConnections,
  startGA4Auth,
  startYouTubeAuth,
  saveGA4PropertyId,
} from "../services/analyticsApi";
import MessageBox from "../components/Analytics/MessageBox";
import DataFetchProgress from "../components/Analytics/DataFetchProgress";
import GA4Card from "../components/Analytics/GA4Card";
import YouTubeCard from "../components/Analytics/YouTubeCard";
import { showMessage } from "../utils/showMessage";

const AnalyticsPage = () => {
  const [connections, setConnections] = useState({
    ga4: false,
    youtube: false,
  });
  const [ga4PropertyId, setGA4PropertyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [dataFetchInProgress, setDataFetchInProgress] = useState(false);

  useEffect(() => {
    checkConnections();

    // URL'den mesaj parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("ga4_connected") === "true") {
      showMessage(
        setMessage,
        setMessageType,
        "GA4 successfully connected! Please set your Property ID to start data collection.",
        "success",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get("youtube_connected") === "true") {
      showMessage(
        setMessage,
        setMessageType,
        "YouTube successfully connected!",
        "success",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(checkConnections, 1000);
    }
    if (urlParams.get("error")) {
      showMessage(
        setMessage,
        setMessageType,
        "Authentication failed. Please try again.",
        "error",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkConnections = async () => {
    try {
      setIsLoading(true);
      const result = await checkConnections();
      if (result.success) {
        setConnections(result.data.connections);
        if (result.data.ga4_property_id) {
          setGA4PropertyId(result.data.ga4_property_id);
        }
      } else {
        showMessage(setMessage, setMessageType, result.message, "error");
      }
    } catch (error) {
      console.error("Error checking connections:", error);
      showMessage(
        setMessage,
        setMessageType,
        "Error checking connections",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGA4Connect = async () => {
    try {
      setIsLoading(true);
      const result = await startGA4Auth();
      if (result.success && result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        showMessage(
          setMessage,
          setMessageType,
          result.message || "Failed to start GA4 authentication",
          "error",
        );
      }
    } catch (error) {
      console.error("GA4 auth error:", error);
      showMessage(setMessage, setMessageType, "GA4 connection failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTubeConnect = async () => {
    try {
      setIsLoading(true);
      const result = await startYouTubeAuth();
      if (result.success && result.data.authorization_url) {
        window.location.href = result.data.authorization_url;
      } else {
        showMessage(
          setMessage,
          setMessageType,
          result.message || "Failed to start YouTube authentication",
          "error",
        );
      }
    } catch (error) {
      console.error("YouTube auth error:", error);
      showMessage(
        setMessage,
        setMessageType,
        "YouTube connection failed",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const savePropertyId = async () => {
    if (!ga4PropertyId.trim()) {
      showMessage(
        setMessage,
        setMessageType,
        "Please enter a valid Property ID",
        "error",
      );
      return;
    }

    try {
      setIsLoading(true);
      setDataFetchInProgress(true);

      const result = await saveGA4PropertyId(ga4PropertyId);
      if (result.success) {
        showMessage(
          setMessage,
          setMessageType,
          "Property ID saved! 🚀 Automatically fetching all your analytics data...",
          "success",
        );

        // 5 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          if (ga4PropertyId && ga4PropertyId.trim()) {
            window.location.href = "/analytics-dashboard";
          } else {
            showMessage(
              setMessage,
              setMessageType,
              "Lütfen geçerli bir GA4 Property ID girin. Bu alan zorunludur.",
              "error",
            );
          }
        }, 5000);
      } else {
        showMessage(
          setMessage,
          setMessageType,
          result.message || "Failed to save Property ID",
          "error",
        );
        setDataFetchInProgress(false);
      }
    } catch (error) {
      console.error("Error saving property ID:", error);
      showMessage(
        setMessage,
        setMessageType,
        "Failed to save Property ID",
        "error",
      );
      setDataFetchInProgress(false);
    } finally {
      setIsLoading(false);
    }
  };

  const goToDashboard = () => {
    window.location.href = "/analytics-dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics Integration
          </h1>
          <p className="text-gray-600">
            Connect your analytics accounts to get comprehensive insights
          </p>
        </div>

        {/* Message Display */}
        <MessageBox message={message} messageType={messageType} />

        {/* Data Fetch Progress */}
        {dataFetchInProgress && <DataFetchProgress />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Google Analytics 4 */}
          <GA4Card
            connected={connections.ga4}
            ga4PropertyId={ga4PropertyId}
            onConnect={handleGA4Connect}
            onSavePropertyId={savePropertyId}
            ga4PropertyIdInput={ga4PropertyId}
            setGA4PropertyIdInput={setGA4PropertyId}
            isLoading={isLoading}
            dataFetchInProgress={dataFetchInProgress}
          />

          {/* YouTube Analytics */}
          <YouTubeCard
            connected={connections.youtube}
            onConnect={handleYouTubeConnect}
            isLoading={isLoading}
          />
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">1️⃣</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Connect Analytics
              </h4>
              <p className="text-sm text-gray-600">
                Connect your GA4 and YouTube accounts using the buttons above.
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">2️⃣</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Set Property ID
              </h4>
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
            <h4 className="font-medium text-blue-900 mb-2">
              🚀 What happens after connecting?
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All your analytics data is automatically collected</li>
              <li>• Data is organized into meaningful insights and tables</li>
              <li>• No need to manually generate individual reports</li>
              <li>
                • Real-time dashboard with audience, traffic, and performance
                metrics
              </li>
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
