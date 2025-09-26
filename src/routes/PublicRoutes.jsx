import { Outlet, Navigate } from "react-router-dom";

function PublicRoutes() {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicRoutes;
