import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        userType: 'company'
      });
      
      if (result.success) {
        // Registration successful, redirect to login with success message
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please log in with your credentials.' 
          }
        });
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-orange-500/10 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Register Header */}
        <div className="text-center mb-8">
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

        {/* Register Container */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8">
            <Link 
              to="/login"
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to login
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Sign up as a Business</h2>
            <p className="text-gray-600 leading-relaxed">
              For brands, agencies, and ecommerce stores who want to boost their influencer marketing
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50"
                  placeholder="Doe"
                />
              </div>
            </div>

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

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50"
                placeholder="Your Company Name"
              />
            </div>

            {/* Password fields */}
            <div className="space-y-5">
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
                  minLength="8"
                />
                <p className="text-xs text-gray-600 mt-1">Password must be at least 8 characters long</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50"
                  placeholder="••••••••"
                />
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
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-600 text-center leading-relaxed">
              By submitting the form above, you agree to our{' '}
              <span className="text-orange-600 underline cursor-pointer hover:text-orange-700 transition-colors">Terms and Conditions</span>
              {' '}and our{' '}
              <span className="text-orange-600 underline cursor-pointer hover:text-orange-700 transition-colors">Privacy Policy</span>.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-700">
            Already have an account? 
            <Link
              to="/login"
              className="text-orange-600 font-semibold hover:text-orange-700 transition-colors ml-1"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;