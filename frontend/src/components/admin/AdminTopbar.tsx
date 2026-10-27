import {
  Bell,
  Menu,
} from "lucide-react";

import {
  useAuth,
} from "../../context/AuthContext";

interface AdminTopbarProps {
  onMenuClick: () => void;
}

const AdminTopbar = ({
  onMenuClick,
}: AdminTopbarProps) => {
  const { user } = useAuth();

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

  const fullName =
    [
      user?.firstName,
      user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-base font-semibold text-slate-900 sm:text-lg">
            Administration
          </h1>

          <p className="hidden text-xs text-slate-500 sm:block">
            Manage your e-commerce platform
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />

          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"
          />
        </button>

        <div className="h-7 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {getInitials(
              user?.firstName,
              user?.lastName,
            )}
          </div>

          <div className="hidden sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-slate-900">
              {fullName}
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;