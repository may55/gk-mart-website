import { useAuth } from "./auth-context";

export function useIsLoggedIn(): boolean {
  const { isLoggedIn } = useAuth();
  return isLoggedIn;
}

export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}

export function useAuthToken() {
  const { token } = useAuth();
  return token;
}

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}

export function useLogin() {
  const { login } = useAuth();
  return login;
}

export function useSignup() {
  const { signup } = useAuth();
  return signup;
}
