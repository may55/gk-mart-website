import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  number: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  signup: (userData: User, token: string) => void;
  hasSkipped: boolean;
  setHasSkipped: (skipped: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "gkmart.auth.v1";
const SKIP_KEY = "gkmart.auth.skipped";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const skipped = localStorage.getItem(SKIP_KEY) === "true";
      
      if (stored) {
        const { user: storedUser, token: storedToken } = JSON.parse(stored);
        setUser(storedUser);
        setToken(storedToken);
      }
      
      setHasSkipped(skipped);
    } catch (error) {
      console.error("Failed to restore auth state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: authToken }));
  };

  const signup = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: authToken }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSetSkipped = (skipped: boolean) => {
    setHasSkipped(skipped);
    localStorage.setItem(SKIP_KEY, skipped ? "true" : "false");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user && !!token,
        login,
        logout,
        signup,
        hasSkipped,
        setHasSkipped: handleSetSkipped,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
