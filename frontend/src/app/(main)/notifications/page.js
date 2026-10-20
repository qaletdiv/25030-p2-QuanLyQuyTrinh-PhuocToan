import { getMeApi } from "@/services/auth.api";
import { getNotificationsApi } from "@/services/notifications.api";
import NotificationsView from "@/components/NotificationsView";

export const metadata = {
  title: "Thông báo — Hệ Thống Duyệt Quy Trình",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getMeApi();
  let notifications = [];
  let unreadCount = 0;

  let errorMsg = null;

  try {
    const data = await getNotificationsApi();
    notifications = data.notifications || [];
    unreadCount = data.unreadCount || 0;
  } catch (err) {
    errorMsg = err.message || "Không thể tải danh sách thông báo. Vui lòng kiểm tra kết nối mạng.";
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl flex items-center gap-2.5 shadow-xs max-w-5xl mx-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <NotificationsView
        initialNotifications={notifications}
        unreadCount={unreadCount}
        userRole={user?.role || "employee"}
      />
    </div>
  );
}

