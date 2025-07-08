import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../services/authApi";
import LoginForm from '../components/Auth/LoginForm';

/**
 * LoginPage, kullanıcıdan e-posta ve şifre alarak giriş işlemini başlatır.
 * Başarılı girişte kullanıcıyı dashboard'a yönlendirir.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
    const storedMessage = localStorage.getItem("register_success_message");
    if (storedMessage) {
      setSuccessMessage(storedMessage);
      localStorage.removeItem("register_success_message");
    }
  }, [location]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await login(formData.email, formData.password, "company");
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-orange-500/10 flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-300/30 to-transparent rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-400/20 to-transparent rounded-full -ml-40 -mb-40"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-l from-orange-200/40 to-transparent rounded-full"></div>

        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 z-20">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center mr-3 p-1">
              <img
                src="/logo.png"
                alt="InfoFluencer Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-800">
              InfoFluencer
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 pt-20">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-6 leading-tight text-gray-800">
              Scale your business with
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                influencer marketing
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Connect with top creators, manage campaigns, and track performance
              with advanced analytics
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  Advanced Creator Analytics
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover authentic influencers with detailed performance
                  metrics and audience insights
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  Campaign Management
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Streamline your influencer partnerships from outreach to
                  performance tracking
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">
                  ROI Tracking
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Measure campaign success with comprehensive reporting and
                  analytics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/80 backdrop-blur-sm">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <Link
              to="/"
              className="flex flex-col items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 border border-gray-100 p-3">
                <img
                  src="./logo.png"
                  alt="InfoFluencer Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML =
                      '<span class="text-orange-600 font-bold text-2xl">IF</span>';
                  }}
                />
              </div>
              <span
                className="text-2xl font-light italic text-gray-800 tracking-wider"
                style={{ fontFamily: "Georgia, serif" }}
              >
                infofluencer
              </span>
            </Link>
          </div>

          {/* Desktop Logo Area */}
          <div className="hidden lg:block text-center mb-8">
            <Link
              to="/"
              className="flex flex-col items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 border border-gray-100 p-3">
                <img
                  src="./logo.png"
                  alt="InfoFluencer Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.innerHTML =
                      '<span class="text-orange-600 font-bold text-2xl">IF</span>';
                  }}
                />
              </div>
              <span
                className="text-2xl font-light italic text-gray-800 tracking-wider"
                style={{ fontFamily: "Georgia, serif" }}
              >
                infofluencer
              </span>
            </Link>
          </div>

          {/* Auth Container */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Log in to InfoFluencer
              </h2>
            </div>
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-center text-sm">
                {successMessage}
              </div>
            )}
            <LoginForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-orange-600 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
