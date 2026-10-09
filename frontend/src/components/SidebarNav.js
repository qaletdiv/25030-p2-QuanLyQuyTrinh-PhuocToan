"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white shadow-xs"
                    : "bg-slate-700 group-hover:bg-blue-400"
                }`}
              />
              <span>{item.label}</span>
            </div>

            <span
              className={`text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "text-white"
                  : "text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1"
              }`}
            >
              →
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
