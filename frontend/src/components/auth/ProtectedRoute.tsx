import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession, getUser } from "../../lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole: "farmer" | "reviewer";
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const location = useLocation();
  const session = getSession();
  const user = getUser();

  // 1. Jika belum login, tendang ke halaman login
  if (!session || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2. Jika role TIDAK COCOK dengan yang diizinkan, kembalikan ke dashboard asalnya
  if (user.role !== allowedRole) {
    if (user.role === "reviewer") {
      return <Navigate to="/reviewer/dashboard" replace />;
    } else {
      return <Navigate to="/farmer/dashboard" replace />;
    }
  }

  // 3. Aman! Tampilkan halaman
  return <>{children}</>;
}