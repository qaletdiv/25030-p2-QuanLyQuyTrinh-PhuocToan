"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
  faCheckDouble,
  faMagnifyingGlass,
  faXmark,
  faInbox,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications.actions";

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications: initialNotifications = [],
  userRole = "employee",
  onNotificationsChange,
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Đồng bộ với danh sách thông báo từ props
  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  // Đóng bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      if (onNotificationsChange) onNotificationsChange(updated, 0);
      router.refresh();
    });
  };

  // Đánh dấu 1 thông báo và chuyển hướng
  const handleItemClick = (item) => {
    if (!item.isRead) {
      startTransition(async () => {
        await markNotificationReadAction(item.id);
        const updated = notifications.map((n) =>
          n.id === item.id ? { ...n, isRead: true } : n,
        );
        setNotifications(updated);
        const newUnread = Math.max(0, unreadCount - 1);
        if (onNotificationsChange) onNotificationsChange(updated, newUnread);
        router.refresh();
      });
    }

    onClose();

    if (item.relatedRequestId) {
      if (
        (userRole === "approver" || userRole === "admin") &&
        item.message.includes("chờ bạn duyệt")
      ) {
        router.push(`/approvals/${item.relatedRequestId}`);
      } else {
        router.push(`/requests/${item.relatedRequestId}`);
      }
    }
  };

  // Lọc theo tab
  let filtered = notifications;
  if (activeTab === "unread") {
    filtered = filtered.filter((n) => !n.isRead);
  } else if (activeTab === "read") {
    filtered = filtered.filter((n) => n.isRead);
  }

  // Lọc theo từ khóa
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (n) =>
        n.message.toLowerCase().includes(q) ||
        (n.relatedRequestId && n.relatedRequestId.toLowerCase().includes(q)),
    );
  }

  const getNotificationIcon = (msg) => {
    if (msg.includes("phê duyệt")) {
      return {
        bg: "bg-emerald-100 text-emerald-600 border-emerald-200",
        icon: faCircleCheck,
      };
    }
    if (msg.includes("từ chối")) {
      return {
        bg: "bg-rose-100 text-rose-600 border-rose-200",
        icon: faCircleXmark,
      };
    }
    if (msg.includes("chờ bạn duyệt")) {
      return {
        bg: "bg-blue-100 text-blue-600 border-blue-200",
        icon: faBell,
      };
    }
    return {
      bg: "bg-purple-100 text-purple-600 border-purple-200",
      icon: faCircleInfo,
    };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FontAwesomeIcon icon={faBell} className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Toàn bộ thông báo
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Theo dõi và xử lý các cập nhật phê duyệt trong hệ thống
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Thanh công cụ tìm kiếm và Tab */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 w-fit text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unread")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "unread"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("read")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "read"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Đã đọc ({readCount})
              </button>
            </div>

            {/* Nút Đánh dấu tất cả đã đọc */}
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline disabled:opacity-50 inline-flex items-center gap-1.5 self-end sm:self-center"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="w-3.5 h-3.5" />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo nội dung, mã đơn (REQ-...)..."
              className="w-full pl-8 pr-8 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder:text-slate-400"
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer w-4 h-4 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách thông báo (cuộn được) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3">
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                <FontAwesomeIcon icon={faInbox} className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                Không tìm thấy thông báo nào
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {searchQuery
                  ? "Hãy thử tìm kiếm với từ khóa khác"
                  : "Bạn đã cập nhật tất cả thông báo mới nhất"}
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const iconConfig = getNotificationIcon(item.message);
              const dateFormatted = item.createdAt
                ? new Date(item.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 group mb-1 ${
                    !item.isRead
                      ? "bg-blue-50/50 hover:bg-blue-50/80 border border-blue-100"
                      : "bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  {/* Icon loại thông báo */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${iconConfig.bg}`}
                  >
                    <FontAwesomeIcon
                      icon={iconConfig.icon}
                      className="w-4 h-4"
                    />
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-relaxed ${
                        !item.isRead
                          ? "font-semibold text-slate-900"
                          : "font-normal text-slate-600"
                      }`}
                    >
                      {item.message}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-slate-400">
                        {dateFormatted}
                      </span>
                      {item.relatedRequestId && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {item.relatedRequestId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút Xem chi tiết */}
                  <div className="shrink-0 self-center opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                      <span>Xem</span>
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className="w-2.5 h-2.5"
                      />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Hiển thị {filtered.length}/{notifications.length} thông báo
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
