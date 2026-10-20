"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faFileLines,
  faPenToSquare,
  faCheckToSlot,
  faFolderTree,
  faDiagramProject,
  faBars,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export default function MobileNav({ role = "employee", user }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Tự động đóng menu khi chuyển trang
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const roleMenus = {
    employee: [
      { label: "Tổng quan", href: "/dashboard", icon: faChartPie },
      { label: "Đơn của tôi", href: "/requests", icon: faFileLines },
      { label: "Tạo đơn mới", href: "/requests/new", icon: faPenToSquare },
    ],
    approver: [
      { label: "Tổng quan", href: "/dashboard", icon: faChartPie },
      { label: "Danh sách duyệt đơn", href: "/approvals", icon: faCheckToSlot },
    ],
    admin: [
      { label: "Tổng quan", href: "/dashboard", icon: faChartPie },
      { label: "Quản lý loại đơn", href: "/admin/request-types", icon: faFolderTree },
      { label: "Cấu hình luồng duyệt", href: "/admin/approval-flows", icon: faDiagramProject },
    ],
  };

  const navItems = roleMenus[role] || roleMenus.employee;

  const roleLabelMap = {
    admin: "Quản Trị Viên",
    approver: "Người Phê Duyệt",
    employee: "Nhân Viên",
  };

  return (
    <div className="md:hidden">
      {/* Nút Hamburger mở menu trên di động */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Mở menu"
      >
        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
      </button>

      {/* Backdrop mờ khi mở Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in"
        />
      )}

      {/* Slide-over Drawer trên Mobile */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950 text-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
          {/* Header Drawer */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Logo"
                width={30}
                height={30}
                priority
                unoptimized
                className="rounded-lg shrink-0 object-contain shadow-xs"
              />
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  Quy Trình Duyệt
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  {roleLabelMap[role] || "Nhân Viên"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Đóng menu"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>
          </div>

          {/* Menu items */}
          <div className="flex-1 p-3.5 space-y-2 overflow-y-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1.5 block">
              Điều hướng chính
            </span>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-xs"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-white" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info footer */}
          <div className="p-4 border-t border-slate-900 bg-slate-950">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-xs font-bold text-slate-200 truncate">
                {user?.name || "Người dùng"}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {user?.email || ""}
              </p>
              <p className="text-[10px] text-blue-400 font-medium">
                Phòng: {user?.department || "Nội bộ"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

