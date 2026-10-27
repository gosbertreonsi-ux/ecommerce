import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const AdminRoute = () => {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="text-sm font-medium text-slate-600">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminRoute;