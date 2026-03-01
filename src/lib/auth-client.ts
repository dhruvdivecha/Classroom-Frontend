import { createAuthClient } from 'better-auth/react';

// In dev, the Vite proxy forwards /api → http://localhost:8000/api
// so we use the current origin to keep requests same-origin.
export const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
});

export const {
  useSession,
} = authClient;
