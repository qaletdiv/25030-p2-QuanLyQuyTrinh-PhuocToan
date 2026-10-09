import Link from 'next/link';
import { getMeApi } from '@/services/auth.api';
import EmployeeDashboard from '@/components/EmployeeDashboard';
import ApproverDashboard from '@/components/ApproverDashboard';
import AdminDashboard from '@/components/AdminDashboard';

export const metadata = {
  title: 'Tổng quan — Hệ Thống Duyệt Quy Trình',
};

export default async function DashboardPage() {
  const user = await getMeApi();
  const role = user?.role || 'employee';

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chào mừng trở lại, {user?.name || 'Người dùng'}! Dưới đây là thông tin hoạt động của bạn.
          </p>
        </div>
        {role === 'employee' && (
          <Link
            href="/requests/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Tạo đơn mới</span>
          </Link>
        )}
      </div>

      {/* Rẽ nhánh giao diện theo Role */}
      {role === 'employee' && <EmployeeDashboard />}
      {role === 'approver' && <ApproverDashboard />}
      {role === 'admin' && <AdminDashboard />}
    </div>
  );
}
