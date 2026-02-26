import { Component } from "react";
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

// Catches any render error that would otherwise produce a blank white screen.
// Shows the error message and stack in-page so it is always visible.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 max-w-xl w-full space-y-4">
            <h1 className="text-lg font-semibold text-red-600">Something went wrong</h1>
            <p className="text-sm text-gray-700 font-mono break-words">
              {this.state.error.message}
            </p>
            {this.state.error.stack && (
              <pre className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 overflow-auto max-h-48">
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <ErrorBoundary>
        <MsalProvider instance={msalInstance}>
          <AppRoutes />
        </MsalProvider>
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
