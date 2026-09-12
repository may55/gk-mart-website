import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth-context";

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3001") + "/api";

export interface SignupFormData {
  name: string;
  email: string;
  number: string;
  password: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    number: string;
  };
  token: string;
}

export function useAuthApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const signup_api = async (formData: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.errors?.[0] || data.message || "Signup failed";
        setError(errorMessage);
        return false;
      }

      // Save to auth context
      if (data.data) {
        signup(data.data.user, data.data.token);
        // Navigate to home after successful signup
        setTimeout(() => navigate({ to: "/" }), 500);
        return true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login_api = async (formData: LoginFormData, redirectTo = "/") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.errors?.[0] || data.message || "Login failed";
        setError(errorMessage);
        return false;
      }

      // Save to auth context
      if (data.data) {
        login(data.data.user, data.data.token);
        // Return users to the page that required authentication when requested.
        setTimeout(() => {
          if (redirectTo.startsWith("/cart")) {
            navigate(
              redirectTo.includes("checkout=1")
                ? { to: "/cart", search: { checkout: "1" } as never }
                : { to: "/cart" },
            );
          } else navigate({ to: "/" });
        }, 500);
        return true;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signup: signup_api,
    login: login_api,
    isLoading,
    error,
    setError,
  };
}
