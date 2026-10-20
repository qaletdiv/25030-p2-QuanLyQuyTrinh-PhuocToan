"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function SidebarNav({ navItems }) {
  // Lấy chính xác URL trang hiện tại mà trình duyệt đang đứng
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        // So khớp đường dẫn: Nếu đúng trang hiện tại thì isActive = true
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/25 border border-blue-500" // Giữ màu xanh vĩnh viễn
                : "text-slate-400 hover:text-white hover:bg-slate-800/90 border border-transparent hover:border-slate-700/60 hover:translate-x-1"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <FontAwesomeIcon
                  icon={item.icon}
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                  }`}
                />
              )}
              <span>{item.label}</span>
            </div>

            <FontAwesomeIcon
              icon={faChevronRight}
              className={`w-2.5 h-2.5 transition-all duration-200 ${
                isActive
                  ? "text-white opacity-100"
                  : "text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
