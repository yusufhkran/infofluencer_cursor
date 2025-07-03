import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for success message from registration (location.state)
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
    
    // Check for success message from localStorage (fallback)
    const storedMessage = localStorage.getItem('register_success_message');
    if (storedMessage) {
      setSuccessMessage(storedMessage);
      localStorage.removeItem('register_success_message'); // Clean up
    }
  }, [location])
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await apiService.login(formData.email, formData.password, 'company');
      
      if (result.success) {
        // Login successful, redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Network error occurred. Please try again.');
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
            <span className="text-xl font-bold text-gray-800">InfoFluencer</span>
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
              Connect with top creators, manage campaigns, and track performance with advanced analytics
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Advanced Creator Analytics</h3>
                <p className="text-gray-600 leading-relaxed">Discover authentic influencers with detailed performance metrics and audience insights</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">Campaign Management</h3>
                <p className="text-gray-600 leading-relaxed">Streamline your influencer partnerships from outreach to performance tracking</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-2">ROI Tracking</h3>
                <p className="text-gray-600 leading-relaxed">Measure campaign success with comprehensive reporting and analytics</p>
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
            <Link to="/" className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 border border-gray-100 p-3">
                <img 
                  src="./logo.png" 
                  alt="InfoFluencer Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span class="text-orange-600 font-bold text-2xl">IF</span>';
                  }}
                />
              </div>
              <span className="text-2xl font-light italic text-gray-800 tracking-wider" style={{fontFamily: 'Georgia, serif'}}>infofluencer</span>
            </Link>
          </div>

          {/* Desktop Logo Area */}
          <div className="hidden lg:block text-center mb-8">
            <Link to="/" className="flex flex-col items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3 border border-gray-100 p-3">
                <img 
                  src="./logo.png" 
                  alt="InfoFluencer Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span class="text-orange-600 font-bold text-2xl">IF</span>';
                  }}
                />
              </div>
              <span className="text-2xl font-light italic text-gray-800 tracking-wider" style={{fontFamily: 'Georgia, serif'}}>infofluencer</span>
            </Link>
          </div>

          {/* Auth Container */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Log in to InfoFluencer</h2>
            </div>

            {/* Google Sign In */}
            <button className="w-full flex items-center justify-center px-6 py-4 border border-gray-200 rounded-xl text-gray-700 bg-white/50 hover:bg-white transition-all mb-6 shadow-sm backdrop-blur-sm">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/95 text-gray-500 font-medium">or</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Success Message */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Work Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Work E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50"
                  placeholder="e.g. email@mycompany.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50"
                  placeholder="••••••••"
                />
                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-gray-600">
                    Don't have password? <span className="text-orange-600 cursor-pointer font-semibold hover:text-orange-700 transition-colors">Get magic link</span>
                  </span>
                  <span className="text-orange-600 cursor-pointer font-semibold hover:text-orange-700 transition-colors">Forgot password?</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Log in'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-700">
              Don't have an account? 
              <Link
                to="/register"
                className="text-orange-600 font-semibold hover:text-orange-700 transition-colors ml-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;