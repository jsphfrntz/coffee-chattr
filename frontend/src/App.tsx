import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import CareerGoals from "@/pages/CareerGoals";
import Jobs from "@/pages/Jobs";
import Resumes from "@/pages/Resumes";
import Network from "@/pages/Network";
import Outreach from "@/pages/Outreach";
import Events from "@/pages/Events";
import Settings from "@/pages/Settings";

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user && !user.onboarding_complete) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* App routes with sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <Layout />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goals" element={<CareerGoals />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/resumes" element={<Resumes />} />
        <Route path="/network" element={<Network />} />
        <Route path="/outreach" element={<Outreach />} />
        <Route path="/events" element={<Events />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
