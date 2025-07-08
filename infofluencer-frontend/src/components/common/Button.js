import React from "react";

const Button = ({
  children,
  type = "button",
  onClick,
  disabled,
  className = "",
  ...rest
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`py-3 px-4 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export default Button;
