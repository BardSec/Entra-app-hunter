import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  AppWindow,
  Key,
  ShieldAlert,
  ClipboardCheck,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getInitials } from "../../lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/apps", label: "App Inventory", icon: AppWindow },
  { to: "/permissions", label: "Permissions", icon: Key },
  { to: "/credentials", label: "Credentials", icon: ShieldAlert },
  { to: "/compliance", label: "Compliance", icon: ClipboardCheck },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 flex-shrink-0 bg-gray-900 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700/50">
        <div className="bg-indigo-600 rounded-lg p-1.5">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">Entra App</p>
          <p className="text-indigo-300 text-xs leading-tight">Auditor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer — shows signed-in user in delegated mode, mode label otherwise */}
      <div className="px-4 py-4 border-t border-gray-700/50">
        {user ? (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-semibold">
              {getInitials(user.name || user.username || "?")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-300 truncate leading-tight">
                {user.name || user.username}
              </p>
              <p className="text-xs text-gray-500 truncate leading-tight">
                {user.username}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-600">Mock data mode</p>
        )}
      </div>
    </aside>
  );
}
