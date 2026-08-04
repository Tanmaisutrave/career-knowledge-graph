import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Companies from "./pages/Companies";
import Jobs from "./pages/Jobs";
import Recommendations from "./pages/Recommendations";
import GraphExplorer from "./pages/GraphExplorer";
import Analytics from "./pages/Analytics";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-2xl font-bold text-gray-200 mb-2">Page Not Found</h2>
      <p className="text-gray-500 text-sm">This route doesn't exist in the graph.</p>
    </div>
  );
}

// Shell layout wrapping all dashboard pages
function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-dark-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — no shell */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />

        {/* All other pages — wrapped in AppShell */}
        <Route path="/dashboard"      element={<AppShell><Dashboard /></AppShell>} />
        <Route path="/users"          element={<AppShell><Users /></AppShell>} />
        <Route path="/skills"         element={<AppShell><Skills /></AppShell>} />
        <Route path="/projects"       element={<AppShell><Projects /></AppShell>} />
        <Route path="/companies"      element={<AppShell><Companies /></AppShell>} />
        <Route path="/jobs"           element={<AppShell><Jobs /></AppShell>} />
        <Route path="/recommendations"element={<AppShell><Recommendations /></AppShell>} />
        <Route path="/graph-explorer" element={<AppShell><GraphExplorer /></AppShell>} />
        <Route path="/analytics"      element={<AppShell><Analytics /></AppShell>} />
        <Route path="*"               element={<AppShell><NotFound /></AppShell>} />
      </Routes>
    </BrowserRouter>
  );
}
