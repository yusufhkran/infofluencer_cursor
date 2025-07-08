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
        className="block text-sm font-bold text-gray-700 mb-1"
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
      className={`block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900 font-medium placeholder-gray-400 shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition ${className}`}
      {...rest}
    />
  </div>
);

export default Input;
