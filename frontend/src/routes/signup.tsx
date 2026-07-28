import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuthApi } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — GK Mart" },
      { name: "description", content: "Create your GK Mart account" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { setHasSkipped } = useAuth();
  const { signup, isLoading, error, setError } = useAuthApi();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.number.trim()) {
      errors.number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.number.replace(/\D/g, ""))) {
      errors.number = "Phone number must be 10 digits";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await signup(formData);
    if (success) {
      // Navigation happens in the hook
    }
  };

  const handleSkip = () => {
    setHasSkipped(true);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur px-5 py-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center justify-center rounded-md hover:bg-muted p-2 -ml-2 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground flex-1 text-center">Sign Up</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign up to save your preferences and place orders
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  fieldErrors.name
                    ? "border-destructive bg-destructive/5"
                    : "border-input bg-background hover:border-input/70"
                }`}
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-destructive font-medium">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  fieldErrors.email
                    ? "border-destructive bg-destructive/5"
                    : "border-input bg-background hover:border-input/70"
                }`}
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone Number Input */}
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                id="number"
                name="number"
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.number}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full px-4 py-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  fieldErrors.number
                    ? "border-destructive bg-destructive/5"
                    : "border-input bg-background hover:border-input/70"
                }`}
                disabled={isLoading}
              />
              {fieldErrors.number && (
                <p className="mt-1 text-xs text-destructive font-medium">{fieldErrors.number}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pr-10 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.password
                      ? "border-destructive bg-destructive/5"
                      : "border-input bg-background hover:border-input/70"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-destructive font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* API Error */}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-md transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Already have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            className="mt-6 block w-full py-3 border border-input text-foreground font-semibold rounded-md transition-colors hover:bg-muted text-center"
          >
            Login
          </Link>

          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="mt-4 w-full py-3 text-muted-foreground font-medium rounded-md transition-colors hover:bg-muted/30 active:scale-95"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
