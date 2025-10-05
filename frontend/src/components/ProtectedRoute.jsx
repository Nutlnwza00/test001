import { Navigate } from "react-router-dom";

// Enhanced ProtectedRoute
// Props:
// - allowedRoles: ["admin", "user", ...] (optional)
// - requiredPermission: string (optional)
// Any condition failing will redirect to /unauthorized (or /login if no token)
export default function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}" );

  if (!token) return <Navigate to="/login" />;

  const userRole = (user.role || "").toLowerCase();
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    if (!normalizedAllowed.includes(userRole)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
