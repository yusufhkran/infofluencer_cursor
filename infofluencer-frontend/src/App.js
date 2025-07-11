import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import AnalyticsPage from "./pages/AnalyticsPage";
import OverviewPage from './pages/OverviewPage';
import SettingsPage from './pages/SettingsPage';
import LoginInfluencerPage from './pages/influencer/LoginInfluencerPage';
import RegisterInfluencerPage from './pages/influencer/RegisterInfluencerPage';
import InfluencerDashboardPage from './pages/influencer/InfluencerDashboardPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// Influencer Protected Route
const InfluencerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('influencer_token');
  return token ? children : <Navigate to="/influencer/login" replace />;
};

// Influencer Public Route
const InfluencerPublicRoute = ({ children }) => {
  const token = localStorage.getItem('influencer_token');
  return token ? <Navigate to="/influencer/dashboard" replace /> : children;
};

// FallbackRoute componentini ekle
const FallbackRoute = () => {
  const influencerToken = localStorage.getItem('influencer_token');
  const companyToken = localStorage.getItem('company_token');
  if (influencerToken) return <Navigate to="/influencer/dashboard" replace />;
  if (companyToken) return <Navigate to="/company/dashboard" replace />;
  // Varsayılan olarak influencer login'e yönlendir
  return <Navigate to="/influencer/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route - redirect to login */}
          <Route path="/" element={<Navigate to="/company_login" replace />} />

          {/* Public routes - only accessible when not logged in */}
          <Route
            path="/company_login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/company_register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Dashboard route - protected */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* AnalyticsPage - protected */}
          <Route
            path="/AnalyticPage"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* SettingsPage - public (gerekirse protected yapılabilir) */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Influencer Auth Routes */}
          <Route
            path="/influencer/login"
            element={
              <InfluencerPublicRoute>
                <LoginInfluencerPage />
              </InfluencerPublicRoute>
            }
          />
          <Route
            path="/influencer/register"
            element={
              <InfluencerPublicRoute>
                <RegisterInfluencerPage />
              </InfluencerPublicRoute>
            }
          />
          <Route
            path="/influencer/dashboard"
            element={
              <InfluencerProtectedRoute>
                <InfluencerDashboardPage />
              </InfluencerProtectedRoute>
            }
          />

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
