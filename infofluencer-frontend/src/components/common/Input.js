import React from "react";

const Input = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  required,
  disabled,
  className = "",
  ...rest
}) => (
  <div className="mb-4">
    {label && (
      <label
        htmlFor={id || name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
    )}
    <input
      id={id || name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${className}`}
      {...rest}
    />
  </div>
);

export default Input;
