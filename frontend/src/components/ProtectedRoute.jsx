import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredPermission }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" />;
  if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
