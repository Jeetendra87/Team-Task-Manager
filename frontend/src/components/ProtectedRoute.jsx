import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth";

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}
