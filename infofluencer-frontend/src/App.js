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

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/company_login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
