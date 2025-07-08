import React from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";

const RegisterForm = ({
  formData,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  emailValidation,
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <Input
      label="First Name"
      id="firstName"
      name="firstName"
      value={formData.firstName}
      onChange={onInputChange}
      required
    />
    <Input
      label="Last Name"
      id="lastName"
      name="lastName"
      value={formData.lastName}
      onChange={onInputChange}
      required
    />
    <Input
      label="Company Email"
      id="email"
      name="email"
      type="email"
      value={formData.email}
      onChange={onInputChange}
      required
    />
    {emailValidation.message && (
      <div
        className={`text-xs mt-1 ${emailValidation.isValid ? "text-green-600" : "text-red-600"}`}
      >
        {emailValidation.message}
      </div>
    )}
    <Input
      label="Company"
      id="company"
      name="company"
      value={formData.company}
      onChange={onInputChange}
      required
    />
    <Input
      label="Password"
      id="password"
      name="password"
      type="password"
      value={formData.password}
      onChange={onInputChange}
      required
    />
    <Input
      label="Confirm Password"
      id="confirmPassword"
      name="confirmPassword"
      type="password"
      value={formData.confirmPassword}
      onChange={onInputChange}
      required
    />
    <ErrorMessage error={error} />
    <Button type="submit" disabled={isLoading}>
      {isLoading ? "Registering..." : "Register"}
    </Button>
  </form>
);

export default RegisterForm;
