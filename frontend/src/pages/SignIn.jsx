import { Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function MicrosoftLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0"  y="0"  width="10" height="10" fill="#f25022" />
      <rect x="11" y="0"  width="10" height="10" fill="#7fba00" />
      <rect x="0"  y="11" width="10" height="10" fill="#00a4ef" />
      <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

export default function SignIn() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 w-full max-w-sm space-y-7 text-center">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-indigo-600 rounded-xl p-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Entra App Auditor</h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in with your work Microsoft account to audit your district's
            app registrations and enterprise applications.
          </p>
        </div>

        {/* Sign-in button */}
        <button
          onClick={login}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#0078d4] hover:bg-[#006cbf] active:bg-[#005ba1] text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <MicrosoftLogo />
          {isLoading ? "Signing in…" : "Sign in with Microsoft"}
        </button>

        <p className="text-xs text-gray-400">
          You'll be asked to approve read-only access to your organization's
          directory and app registrations.
        </p>
      </div>
    </div>
  );
}
