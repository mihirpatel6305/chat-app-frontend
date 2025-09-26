import { Outlet, Navigate } from "react-router-dom";

function ProtectedRoutes() {
  const isLoggedIn = localStorage.getItem("token");

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoutes;
