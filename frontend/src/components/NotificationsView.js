"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function NotificationsView({
  initialNotifications = [],
  unreadCount: initialUnreadCount = 0,
  userRole = "employee",
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unread' | 'read'
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      router.refresh();
    });
  };

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkSingleRead = (e, id) => {
    e.stopPropagation();
    startTransition(async () => {
      await markNotificationReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      router.refresh();
    });
  };

  // Click vào thông báo để chuyển hướng
  const handleItemClick = (item) => {
    if (!item.isRead) {
      startTransition(async () => {
        await markNotificationReadAction(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        router.refresh();
      });
    }

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

  // Lọc theo tìm kiếm
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (n) =>
        n.message.toLowerCase().includes(q) ||
        (n.relatedRequestId && n.relatedRequestId.toLowerCase().includes(q))
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Tiêu đề & Nút thao tác nhanh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Toàn bộ thông báo
            </h1>
            {unreadCount > 0 && (
              <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến trình phê duyệt, cập nhật trạng thái đơn và thông báo hành động từ hệ thống
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-200/80 shrink-0 disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faCheckDouble} className="w-3.5 h-3.5" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
        )}
      </div>

      {/* Thanh lọc & tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tab lọc trạng thái */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "read"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đã đọc ({readCount})
          </button>
        </div>

        {/* Ô tìm kiếm thông báo */}
        <div className="relative sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung, mã đơn..."
            className="w-full pl-8 pr-8 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs placeholder:text-slate-400"
          />
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
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

      {/* Danh sách thông báo dạng Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FontAwesomeIcon icon={faInbox} className="w-12 h-12 text-slate-300 block mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">
              {activeTab === "unread"
                ? "Không có thông báo chưa đọc nào"
                : activeTab === "read"
                ? "Chưa có thông báo đã đọc"
                : "Bạn chưa có thông báo nào"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Các thông báo mới về duyệt đơn, phản hồi sẽ xuất hiện tại đây
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const { bg, icon } = getNotificationIcon(item.message);
            const dateFormatted = item.createdAt
              ? new Date(item.createdAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "";

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-4 sm:p-5 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !item.isRead
                    ? "bg-blue-50/30 hover:bg-blue-50/60"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Icon loại thông báo */}
                  <span
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${bg}`}
                  >
                    <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                  </span>

                  {/* Nội dung thông báo */}
                  <div className="min-w-0 space-y-1">
                    <p
                      className={`text-sm leading-relaxed ${
                        !item.isRead
                          ? "font-bold text-slate-900"
                          : "font-medium text-slate-700"
                      }`}
                    >
                      {item.message}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{dateFormatted}</span>
                      {item.relatedRequestId && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 text-[11px]">
                            {item.relatedRequestId}
                          </span>
                        </>
                      )}
                      {!item.isRead && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] font-bold text-blue-600">
                            Chưa đọc
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Các nút thao tác */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkSingleRead(e, item.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer border border-slate-200"
                      title="Đánh dấu đã đọc"
                    >
                      Đã đọc
                    </button>
                  )}

                  {item.relatedRequestId && (
                    <span className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 group">
                      <span>Xem chi tiết</span>
                      <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

