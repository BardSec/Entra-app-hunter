import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./lib/msal";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import AppInventory from "./pages/AppInventory";
import Permissions from "./pages/Permissions";
import Credentials from "./pages/Credentials";
import Compliance from "./pages/Compliance";
import LoadingSpinner from "./components/shared/LoadingSpinner";

const AUTH_MODE = import.meta.env.VITE_AUTH_MODE || "mock";

function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Checking authentication…" />
      </div>
    );
  }
  if (!isAuthenticated) return <SignIn />;
  return children;
}

function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="apps" element={<AppInventory />} />
              <Route path="permissions" element={<Permissions />} />
              <Route path="credentials" element={<Credentials />} />
              <Route path="compliance" element={<Compliance />} />
            </Route>
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default function App() {
  if (AUTH_MODE === "delegated") {
    return (
      <MsalProvider instance={msalInstance}>
        <AppRoutes />
      </MsalProvider>
    );
  }
  return <AppRoutes />;
}
