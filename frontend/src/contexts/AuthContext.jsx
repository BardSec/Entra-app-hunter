import { createContext, useContext, useEffect } from "react";
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
  const isLoading = inProgress !== InteractionStatus.None;
  const user = accounts[0] ?? null;

  // Keep the stored access token fresh whenever the active account changes
  useEffect(() => {
    if (!user) return;
    instance
      .acquireTokenSilent({ scopes: GRAPH_SCOPES, account: user })
      .then((result) => {
        sessionStorage.setItem("entra_access_token", result.accessToken);
      })
      .catch(() => {
        // Silent renewal failed (e.g. consent required) — clear stale token;
        // the user will be prompted again on the next API call via popup.
        sessionStorage.removeItem("entra_access_token");
      });
  }, [user, instance]);

  const login = () =>
    instance.loginPopup({ scopes: GRAPH_SCOPES }).then((result) => {
      sessionStorage.setItem("entra_access_token", result.accessToken);
    });

  const logout = () => {
    sessionStorage.removeItem("entra_access_token");
    instance.logoutPopup();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
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
