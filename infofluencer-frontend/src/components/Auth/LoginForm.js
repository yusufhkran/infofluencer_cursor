import React from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";

const LoginForm = ({ formData, onInputChange, onSubmit, isLoading, error }) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <Input
      label="Email"
      id="email"
      name="email"
      type="email"
      value={formData.email}
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
    <ErrorMessage error={error} />
    <Button type="submit" disabled={isLoading}>
      {isLoading ? "Logging in..." : "Log In"}
    </Button>
  </form>
);

export default LoginForm;
