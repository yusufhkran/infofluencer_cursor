import React, { useState, useEffect } from 'react';
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
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecked: false,
    message: ''
  });

  // Personal email domains that are NOT allowed for company accounts
  const PERSONAL_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
    'icloud.com', 'me.com', 'mac.com', 'aol.com', 'yandex.com',
    'mail.ru', 'protonmail.com', 'tutanota.com', 'zoho.com',
    'gmx.com', 'web.de', 'fastmail.com', 'hushmail.com'
  ];

  // Email validation function
  const validateCompanyEmail = (email) => {
    if (!email || !email.includes('@')) {
      return {
        isValid: false,
        isChecked: false,
        message: ''
      };
    }

    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) {
      return {
        isValid: false,
        isChecked: true,
        message: 'Please enter a valid email address.'
      };
    }

    // Check if it's a personal email
    if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
      return {
        isValid: false,
        isChecked: true,
        message: 'Personal email addresses (Gmail, Yahoo, etc.) are not allowed. Please use your company email.'
      };
    }

    // Basic domain validation
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
    if (!domainPattern.test(domain)) {
      return {
        isValid: false,
        isChecked: true,
        message: 'Please enter a valid company email address.'
      };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /.*temp.*/i,
      /.*throwaway.*/i,
      /.*disposable.*/i,
      /.*10minutemail.*/i,
      /.*guerrillamail.*/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(domain)) {
        return {
          isValid: false,
          isChecked: true,
          message: 'Temporary email addresses are not allowed. Please use your company email.'
        };
      }
    }

    return {
      isValid: true,
      isChecked: true,
      message: 'Valid company email address ✓'
    };
  };

  // Real-time email validation
  useEffect(() => {
    if (formData.email) {
      const validation = validateCompanyEmail(formData.email);
      setEmailValidation(validation);
    } else {
      setEmailValidation({
        isValid: false,
        isChecked: false,
        message: ''
      });
    }
  }, [formData.email]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Check if form is valid
  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      emailValidation.isValid &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please fix all errors before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');

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
        navigate('/login', { 
          state: { 
            message: result.message || 'Registration successful! Please log in with your credentials.' 
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50 ${
                  emailValidation.isChecked
                    ? emailValidation.isValid
                      ? 'border-green-300 focus:ring-green-400'
                      : 'border-red-300 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-orange-400'
                }`}
                placeholder="john@yourcompany.com"
              />
              
              {/* Dynamic Email Validation Messages */}
              {emailValidation.isChecked && (
                <div className={`mt-2 p-3 rounded-lg backdrop-blur-sm ${
                  emailValidation.isValid
                    ? 'bg-green-50/80 border border-green-200/60'
                    : 'bg-red-50/80 border border-red-200/60'
                }`}>
                  <p className={`text-xs flex items-center ${
                    emailValidation.isValid ? 'text-green-800/90' : 'text-red-800/90'
                  }`}>
                    {emailValidation.isValid ? (
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {emailValidation.message}
                  </p>
                </div>
              )}

              {/* Info Message for when email field is empty */}
              {!emailValidation.isChecked && !formData.email && (
                <div className="mt-2 p-3 bg-orange-50/80 border border-orange-200/60 rounded-lg backdrop-blur-sm">
                  <p className="text-xs text-orange-800/90">
                    <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Please use your company email address. Personal emails (Gmail, Yahoo, etc.) are not allowed for business accounts.
                  </p>
                </div>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
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
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50 ${
                    formData.password.length > 0
                      ? formData.password.length >= 8
                        ? 'border-green-300 focus:ring-green-400'
                        : 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-400'
                  }`}
                  placeholder="••••••••"
                  minLength="8"
                />
                <p className={`text-xs mt-1 ${
                  formData.password.length > 0
                    ? formData.password.length >= 8
                      ? 'text-green-600'
                      : 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  Password must be at least 8 characters long {formData.password.length >= 8 && '✓'}
                </p>
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
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all disabled:opacity-50 ${
                    formData.confirmPassword.length > 0
                      ? formData.password === formData.confirmPassword
                        ? 'border-green-300 focus:ring-green-400'
                        : 'border-red-300 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-orange-400'
                  }`}
                  placeholder="••••••••"
                />
                {formData.confirmPassword.length > 0 && (
                  <p className={`text-xs mt-1 ${
                    formData.password === formData.confirmPassword
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formData.password === formData.confirmPassword ? 'Passwords match ✓' : 'Passwords do not match'}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all transform shadow-lg ${
                isFormValid() && !isLoading
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:-translate-y-1 hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
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

            {/* Form Validation Status */}
            {!isFormValid() && (formData.firstName || formData.lastName || formData.email || formData.password || formData.confirmPassword) && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Please complete all required fields with valid information to continue
                </p>
              </div>
            )}

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