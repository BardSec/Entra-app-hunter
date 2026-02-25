import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  AppWindow,
  Key,
  ShieldAlert,
  ClipboardCheck,
  Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/apps", label: "App Inventory", icon: AppWindow },
  { to: "/permissions", label: "Permissions", icon: Key },
  { to: "/credentials", label: "Credentials", icon: ShieldAlert },
  { to: "/compliance", label: "Compliance", icon: ClipboardCheck },
];

export default function Sidebar() {
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

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-600">Mock data mode</p>
        <p className="text-xs text-gray-500 mt-0.5">Lakewood USD</p>
      </div>
    </aside>
  );
}
