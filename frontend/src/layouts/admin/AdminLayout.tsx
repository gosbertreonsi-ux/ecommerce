import {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";

const AdminLayout = () => {
  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      />

      <div className="min-h-screen lg:pl-64">
        <AdminTopbar
          onMenuClick={() =>
            setMobileMenuOpen(true)
          }
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;