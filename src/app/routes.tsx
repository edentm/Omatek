import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AIAnalysis from "./pages/AIAnalysis";
import Reports from "./pages/Reports";
import Documents from "./pages/Documents";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import AuditLog from "./pages/AuditLog";
import DashboardLayout from "./components/DashboardLayout";
import { DocumentProvider } from "../contexts/DocumentContext";
import { TokenLedgerProvider } from "../contexts/TokenLedgerContext";

function ProtectedRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return (
    <TokenLedgerProvider>
      <DocumentProvider>
        <DashboardLayout />
      </DocumentProvider>
    </TokenLedgerProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "ai-analysis",
        element: <AIAnalysis />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "documents",
        element: <Documents />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
      {
        path: "audit-log",
        element: <AuditLog />,
      },
    ],
  },
]);
