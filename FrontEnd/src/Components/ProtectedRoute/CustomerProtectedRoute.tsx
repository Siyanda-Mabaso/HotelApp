import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../Store/store";

const CustomerProtectedRoute = () => {
  const token = useSelector((state: RootState) => state.login.token);
  const user = useSelector((state: RootState) => state.login.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admins should use the admin dashboard, not customer booking.
  if (user.role !== "customer") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default CustomerProtectedRoute;
