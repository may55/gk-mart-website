import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuthApi } from "@/lib/auth-api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "",
  }),
  head: () => ({
    meta: [
      { title: "Login — GK Mart" },
      { name: "description", content: "Login to your GK Mart account" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { setHasSkipped } = useAuth();
  const { login, isLoading, error, setError } = useAuthApi();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
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

    if (!formData.identifier.trim()) {
      errors.identifier = "Email or phone number is required";
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

    const success = await login(formData, redirect || undefined);
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
        <h1 className="text-lg font-semibold text-foreground flex-1 text-center">Login</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Login with your email or phone number to continue shopping
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Phone Input */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email or Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Enter email or 10-digit number"
                value={formData.identifier}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  fieldErrors.identifier
                    ? "border-destructive bg-destructive/5"
                    : "border-input bg-background hover:border-input/70"
                }`}
                disabled={isLoading}
              />
              {fieldErrors.identifier && (
                <p className="mt-1 text-xs text-destructive font-medium">
                  {fieldErrors.identifier}
                </p>
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
                  placeholder="Enter your password"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">Don't have an account?</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Signup Link */}
          <Link
            to="/signup"
            className="mt-6 block w-full py-3 border border-input text-foreground font-semibold rounded-md transition-colors hover:bg-muted text-center"
          >
            Create Account
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
