import { createAuthClient } from "better-auth/react";

// Use the current page's origin for the API base URL
// This works for both local development and production
const authBaseURL =
  typeof window === "undefined"
    ? // For SSR/Server-side, default to localhost (will be overridden by env var if set)
      "http://localhost:8788/api/auth"
    : // For client-side, use the current page's origin
      new URL("/api/auth", window.location.origin).toString();

export const authClient = createAuthClient({
  baseURL: authBaseURL,
});

export const {
  useSession,
  signIn,
  signOut,
} = authClient;
