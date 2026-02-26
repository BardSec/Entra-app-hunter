import { createContext, useContext, useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { GRAPH_SCOPES } from "../lib/msal";

const AuthContext = createContext(null);

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "mock";

// ── Mock / app-only mode — always authenticated, no sign-in UI ───────────────

function StaticAuthProvider({ children }) {
  return (
    <AuthContext.Provider
      value={{ isAuthenticated: true, isLoading: false, user: null, login: () => {}, logout: () => {} }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Delegated mode — real MSAL sign-in ───────────────────────────────────────

function MsalAuthProvider({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [tokenReady, setTokenReady] = useState(false);
  const [tokenFailed, setTokenFailed] = useState(false);
  const user = accounts[0] ?? null;

  // isLoading stays true while MSAL is processing OR while we are waiting for
  // the initial silent token acquisition to complete.  This prevents API calls
  // (and the 401 that follows) from firing before the token lands in storage.
  // tokenFailed breaks the wait so the user sees the sign-in page instead of
  // spinning forever when silent renewal cannot succeed.
  const isMsalBusy = inProgress !== InteractionStatus.None;
  const isLoading = isMsalBusy || (isAuthenticated && !tokenReady && !tokenFailed);

  // Treat silent-renewal failure as "not authenticated" so AuthGuard shows
  // the sign-in page and the user can do a fresh interactive login.
  const effectivelyAuthenticated = isAuthenticated && tokenReady;

  // Keep the stored access token fresh whenever the active account changes
  useEffect(() => {
    if (!user) {
      setTokenReady(false);
      setTokenFailed(false);
      return;
    }
    setTokenReady(false);
    setTokenFailed(false);
    instance
      .acquireTokenSilent({ scopes: GRAPH_SCOPES, account: user })
      .then((result) => {
        sessionStorage.setItem("entra_access_token", result.accessToken);
        setTokenReady(true);
      })
      .catch(() => {
        // Silent renewal failed (e.g. consent required, token revoked) —
        // clear any stale token and surface the sign-in page via AuthGuard.
        sessionStorage.removeItem("entra_access_token");
        setTokenFailed(true);
      });
  }, [user, instance]);

  const login = () => instance.loginRedirect({ scopes: GRAPH_SCOPES });

  const logout = () => {
    sessionStorage.removeItem("entra_access_token");
    instance.logoutRedirect();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: effectivelyAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  if (AUTH_MODE !== "delegated") {
    return <StaticAuthProvider>{children}</StaticAuthProvider>;
  }
  return <MsalAuthProvider>{children}</MsalAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
