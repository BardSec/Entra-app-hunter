import { PublicClientApplication } from "@azure/msal-browser";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID || "common"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
});

// Delegated scopes the app needs to call Graph API on behalf of the signed-in user
export const GRAPH_SCOPES = [
  "https://graph.microsoft.com/Directory.Read.All",
  "https://graph.microsoft.com/Application.Read.All",
  "https://graph.microsoft.com/AuditLog.Read.All",
];
