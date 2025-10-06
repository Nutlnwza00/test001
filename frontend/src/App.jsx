import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/ฺBooking";
import Schedule from "./pages/Schedule";
import Checkin from "./pages/Checkin";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import RoundTripManager from "./pages/RoundTripManager";
import AdminDashboard from "./pages/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionManagement from "./pages/PermissionManagement";
import { Toaster } from "react-hot-toast";
import EmployeeManagement from "./pages/EmployeeManagement";

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/profile" element={<Profile />} />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rounds"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <RoundTripManager />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
