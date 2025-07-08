import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authApi";
import RegisterForm from '../components/Auth/RegisterForm';
import { validateCompanyEmail } from "../utils/validateCompanyEmail";

/**
 * RegisterPage, yeni kullanıcıdan gerekli bilgileri alarak kayıt işlemini başlatır.
 * Başarılı kayıtta kullanıcıyı giriş ekranına yönlendirir.
 */

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    isChecked: false,
    message: "",
  });

  // Personal email domains that are NOT allowed for company accounts
  const PERSONAL_EMAIL_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "live.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "aol.com",
    "yandex.com",
    "mail.ru",
    "protonmail.com",
    "tutanota.com",
    "zoho.com",
    "gmx.com",
    "web.de",
    "fastmail.com",
    "hushmail.com",
  ];

  // Real-time email validation
  useEffect(() => {
    if (formData.email) {
      const validation = validateCompanyEmail(formData.email);
      setEmailValidation(validation);
    } else {
      setEmailValidation({
        isValid: false,
        isChecked: false,
        message: "",
      });
    }
  }, [formData.email]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
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

  // RegisterPage.js handleSubmit fonksiyonunu bu temiz versiyonla değiştirin:

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Please fix all errors before submitting.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        userType: "company",
      };

      const result = await register(registerData);

      if (result.success) {
        // Success mesajını localStorage'a kaydet
        const successMessage =
          result.message ||
          "Registration successful! Please log in with your credentials.";
        localStorage.setItem("register_success_message", successMessage);

        setIsLoading(false);

        // Force navigation to login
        setTimeout(() => {
          window.location.href = "/company_login";
        }, 500);
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    } catch (error) {
      setError("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400/10 via-orange-300/5 to-orange-500/10 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Register Header */}
        <div className="text-center mb-8">
          <Link
            to="/company_login"
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

        {/* Register Container */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-8">
            <Link
              to="/company_login"
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to login
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Sign up as a Business
            </h2>
            <p className="text-gray-600 leading-relaxed">
              For brands, agencies, and ecommerce stores who want to boost their
              influencer marketing
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            emailValidation={emailValidation}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-700">
            Already have an account?
            <Link
              to="/company_login"
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
