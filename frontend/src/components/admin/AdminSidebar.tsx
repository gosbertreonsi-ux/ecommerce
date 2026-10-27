import {
  NavLink,
} from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  Tags,
  BriefcaseBusiness,
  Boxes,
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  Store,
  X,
  LogOut,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

interface AdminSidebarProps {
  mobileMenuOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    path: "/admin/products",
    icon: Package,
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },
  {
    name: "Brands",
    path: "/admin/brands",
    icon: BriefcaseBusiness,
  },
  {
    name: "Inventory",
    path: "/admin/inventory",
    icon: Boxes,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Payments",
    path: "/admin/payments",
    icon: CreditCard,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: Star,
  },
];

const AdminSidebar = ({
  mobileMenuOpen = false,
  onClose,
}: AdminSidebarProps) => {
  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  const getInitials = (
    firstName?: string,
    lastName?: string,
  ) => {
    const first =
      firstName?.charAt(0) ?? "";

    const last =
      lastName?.charAt(0) ?? "";

    return (
      `${first}${last}`.toUpperCase() ||
      "A"
    );
  };

  return (
    <>
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Store size={20} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                E-Commerce
              </p>

              <p className="text-xs text-slate-500">
                Admin Panel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map(
            ({
              name,
              path,
              icon: Icon,
            }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/admin"}
                onClick={onClose}
                className={({
                  isActive,
                }) =>
                  [
                    "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")
                }
              >
                <Icon
                  size={19}
                  className="shrink-0"
                />

                <span>{name}</span>
              </NavLink>
            ),
          )}
        </nav>

        {/* Admin profile + logout */}
        <div className="shrink-0 border-t border-slate-200 p-4">
          <div className="mb-3 rounded-lg bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {getInitials(
                  user?.firstName,
                  user?.lastName,
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {user?.firstName ?? "Admin"}{" "}
                  {user?.lastName ?? ""}
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <LogOut
              size={19}
              className="shrink-0"
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;