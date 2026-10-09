import Image from 'next/image';
import SidebarNav from '@/components/SidebarNav';

export default function Sidebar({ role = 'employee' }) {
  const roleMenus = {
    employee: [
      { label: 'Tổng quan', href: '/dashboard' },
      { label: 'Đơn của tôi', href: '/requests' },
      { label: 'Tạo đơn mới', href: '/requests/new' },
    ],
    approver: [
      { label: 'Tổng quan', href: '/dashboard' },
      { label: 'Danh sách duyệt đơn', href: '/approvals' },
    ],
    admin: [
      { label: 'Tổng quan', href: '/dashboard' },
      { label: 'Quản lý loại đơn', href: '/admin/request-types' },
      { label: 'Cấu hình luồng duyệt', href: '/admin/approval-flows' },
    ],
  };

  const navItems = roleMenus[role] || roleMenus.employee;

  const roleLabelMap = {
    admin: 'Quản Trị Viên',
    approver: 'Người Phê Duyệt',
    employee: 'Nhân Viên',
  };

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen flex flex-col shrink-0 border-r border-slate-800/80 select-none">
      {/* Logo & Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          className="rounded-lg ring-1 ring-white/10 shrink-0 shadow-xs"
        />
        <div className="min-w-0">
          <span className="font-bold text-sm tracking-tight text-white block truncate">
            Quy Trình Duyệt
          </span>
          <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase block">
            Hệ thống nội bộ
          </span>
        </div>
      </div>

      {/* Danh mục menu */}
      <div className="flex-1 p-3 space-y-6 overflow-y-auto">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-2 block">
            Bảng điều hướng
          </span>

          {/* Component bắt URL và giữ màu active vĩnh viễn */}
          <SidebarNav navItems={navItems} />
        </div>
      </div>

      {/* Card trạng thái chân trang */}
      <div className="p-3 border-t border-slate-900 bg-slate-950">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-300">
              {roleLabelMap[role] || 'Nhân Viên'}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            Phiên làm việc bảo mật
          </p>
        </div>
      </div>
    </aside>
  );
}
