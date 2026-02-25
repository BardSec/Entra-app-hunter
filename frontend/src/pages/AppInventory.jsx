import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useApps } from "../hooks/useApps";
import AppTable from "../components/apps/AppTable";
import AppDetailPanel from "../components/apps/AppDetailPanel";
import LoadingSpinner from "../components/shared/LoadingSpinner";
import TopBar from "../components/layout/TopBar";

const RISK_OPTIONS = [
  { value: "", label: "All risk levels" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "registration", label: "Registrations only" },
  { value: "enterprise", label: "Enterprise only" },
];

export default function AppInventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState(searchParams.get("risk") || "");
  const [type, setType] = useState("all");
  const [ownerless, setOwnerless] = useState(searchParams.get("ownerless") === "true");
  const [showFilters, setShowFilters] = useState(false);

  const filters = {
    ...(search && { search }),
    ...(risk && { risk }),
    ...(type !== "all" && { type }),
    ...(ownerless && { ownerless: "true" }),
  };

  const { data: apps, isLoading, error } = useApps(filters);

  // Sync URL params → local state on mount
  useEffect(() => {
    const riskParam = searchParams.get("risk");
    const ownerlessParam = searchParams.get("ownerless");
    if (riskParam) setRisk(riskParam);
    if (ownerlessParam === "true") setOwnerless(true);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setRisk("");
    setType("all");
    setOwnerless(false);
    setSearchParams({});
  };

  const hasActiveFilters = search || risk || type !== "all" || ownerless;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="App Inventory"
        subtitle={apps ? `${apps.length} app${apps.length !== 1 ? "s" : ""}` : ""}
      />

      {/* Filter bar */}
      <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search apps…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <button
          onClick={() => setShowFilters((f) => !f)}
          className={`flex items-center gap-1.5 text-sm px-3 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-indigo-50 border-indigo-200 text-indigo-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-indigo-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {[search, risk, type !== "all", ownerless].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3">
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {RISK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={ownerless}
              onChange={(e) => setOwnerless(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-300"
            />
            Ownerless only
          </label>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-auto ${selectedApp ? "lg:mr-[448px]" : ""}`}>
        {isLoading && <LoadingSpinner message="Loading apps…" />}
        {error && (
          <div className="p-8 text-red-600 text-sm">Failed to load apps: {error.message}</div>
        )}
        {apps && (
          <div className="bg-white rounded-none min-h-full">
            <AppTable
              apps={apps}
              onSelect={(app) => setSelectedApp(app.id === selectedApp?.id ? null : app)}
              selectedId={selectedApp?.id}
            />
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedApp && (
        <AppDetailPanel
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
