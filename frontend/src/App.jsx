import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import AppInventory from "./pages/AppInventory";
import Permissions from "./pages/Permissions";
import Credentials from "./pages/Credentials";
import Compliance from "./pages/Compliance";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="apps" element={<AppInventory />} />
          <Route path="permissions" element={<Permissions />} />
          <Route path="credentials" element={<Credentials />} />
          <Route path="compliance" element={<Compliance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
