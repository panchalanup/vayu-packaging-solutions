import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ADMIN_ROUTES } from "@/config/adminAuth";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const AdminRouteGuard = () => {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to={ADMIN_ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default AdminRouteGuard;