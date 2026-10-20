"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faInbox,
  faCheckDouble,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notifications.actions";
import NotificationsModal from "@/components/NotificationsModal";

export default function NotificationBell({
  initialNotifications = [],
  initialUnreadCount = 0,
  userRole = "employee",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cập nhật state nếu props từ server thay đổi
  useEffect(() => {
    setNotifications(initialNotifications);
    setUnreadCount(initialUnreadCount);
  }, [initialNotifications, initialUnreadCount]);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  };

  // Đánh dấu 1 thông báo và chuyển hướng
  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      startTransition(async () => {
        await markNotificationReadAction(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });
    }

    setIsOpen(false);

    // Chuyển hướng tới đơn liên quan nếu có
    if (item.relatedRequestId) {
      if (userRole === "approver" && item.message.includes("chờ bạn duyệt")) {
        router.push(`/approvals/${item.relatedRequestId}`);
      } else {
        router.push(`/requests/${item.relatedRequestId}`);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Nút Chuông thông báo */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Thông báo"
        title="Thông báo hệ thống"
      >
        <FontAwesomeIcon icon={faBell} className="w-5 h-5" />

        {/* Số thông báo chưa đọc (Badge đỏ) */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full text-[10px] font-bold h-4 min-w-4 px-1 flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Menu thả xuống (Dropdown Panel) */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150">
          {/* Header của Popup */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800">
                Thông báo
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faCheckDouble} className="w-3 h-3" />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <FontAwesomeIcon icon={faInbox} className="w-8 h-8 text-slate-300 block mx-auto mb-2" />
                Bạn không có thông báo nào.
              </div>
            ) : (
              notifications.map((item) => {
                const dateFormatted = item.createdAt
                  ? new Date(item.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                      !item.isRead ? "bg-blue-50/40" : "bg-white"
                    }`}
                  >
                    {/* Dấu chấm trạng thái */}
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !item.isRead
                          ? "bg-blue-600 ring-2 ring-blue-100"
                          : "bg-transparent"
                      }`}
                    />

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
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {dateFormatted}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer nút mở modal xem tất cả thông báo */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-blue-50/60"
            >
              <span>Xem tất cả thông báo</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal hiển thị toàn bộ thông báo */}
      <NotificationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={notifications}
        userRole={userRole}
        onNotificationsChange={(updated, count) => {
          setNotifications(updated);
          setUnreadCount(count);
        }}
      />
    </div>
  );
}
