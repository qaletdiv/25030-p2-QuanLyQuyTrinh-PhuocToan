import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/NotificationBell";
import { getNotificationsApi } from "@/services/notifications.api";

export default async function Header({ user }) {
  let notifications = [];
  let unreadCount = 0;

  try {
    const notifData = await getNotificationsApi();
    notifications = notifData.notifications || [];
    unreadCount = notifData.unreadCount || 0;
  } catch (err) {
    console.error("Lỗi khi tải thông báo:", err);
  }

  const roleConfig = {
    admin: {
      label: "Quản trị viên",
      badge: "bg-purple-50 text-purple-700 border-purple-200/80 ring-1 ring-purple-500/10",
    },
    approver: {
      label: "Người duyệt",
      badge: "bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10",
    },
    employee: {
      label: "Nhân viên",
      badge: "bg-blue-50 text-blue-700 border-blue-200/80 ring-1 ring-blue-500/10",
    },
  };

  const currentRole = roleConfig[user?.role] || roleConfig.employee;

  // Lấy chữ cái đầu của tên để làm Avatar
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Bên trái: Breadcrumb định vị chuyên nghiệp */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Cổng thông tin
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-bold text-slate-800">
          {user?.department || "Nội bộ công ty"}
        </span>
      </div>

      {/* Bên phải: Chuông thông báo, User Info & Nút Đăng xuất */}
      <div className="flex items-center gap-4">
        {/* Chuông thông báo (A.7) */}
        <NotificationBell
          initialNotifications={notifications}
          initialUnreadCount={unreadCount}
          userRole={user?.role}
        />

        {/* Đường kẻ phân cách */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Khối User Info */}
        <div className="flex items-center gap-3 pr-2">
          {/* Avatar Gradient tròn */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-xs ring-2 ring-white">
            {initial}
          </div>

          {/* Tên & Role */}
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800 leading-none">
                {user?.name || "Người dùng"}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${currentRole.badge}`}
              >
                {currentRole.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-none font-normal">
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* Đường kẻ phân cách */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Nút Đăng xuất */}
        <LogoutButton />
      </div>
    </header>
  );
}
