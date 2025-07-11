import React from "react";

const Button = ({
  children,
  type = "button",
  onClick,
  disabled,
  className = "",
  variant = "primary",
  size = "md",
  ...rest
}) => {
  const baseClasses = "rounded-lg font-semibold transition-colors disabled:opacity-50";
  
  const variantClasses = {
    primary: "bg-orange-600 text-white hover:bg-orange-700",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
  };
  
  const sizeClasses = {
    sm: "py-2 px-3 text-sm",
    md: "py-3 px-4",
    lg: "py-4 px-6 text-lg",
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
