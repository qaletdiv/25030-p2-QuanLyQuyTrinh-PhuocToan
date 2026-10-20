import { getAdminDashboardStatsApi } from "@/services/admin.api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faClock,
  faUsers,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import RequestsTimeChart from "@/components/RequestsTimeChart";
import RequestTypesChart from "@/components/RequestTypesChart";
import DepartmentAccountsChart from "@/components/DepartmentAccountsChart";

export default async function AdminDashboard() {
  let statsData = {
    totalRequests: 0,
    activeUsers: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    successRate: "100%",
    weeklyStats: [],
    monthlyStats: [],
    requestTypeDistribution: [],
    requestTypeStats: { leave: 0, purchase: 0, total: 1 },
    departments: [],
  };

  let errorMsg = null;

  try {
    statsData = await getAdminDashboardStatsApi();
  } catch (err) {
    errorMsg = err.message || "Không thể tải số liệu thống kê quản trị. Vui lòng kiểm tra kết nối API.";
  }

  const {
    totalRequests,
    activeUsers,
    pendingCount,
    successRate,
    weeklyStats,
    monthlyStats,
    requestTypeDistribution,
    departments,
  } = statsData;

  return (
    <div className="space-y-6">
      {/* Banner thông báo lỗi nếu có */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl flex items-center gap-2.5 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* 4 Thẻ thống kê toàn hệ thống */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-purple-50 text-purple-900 border-purple-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Tổng lượt tạo đơn</p>
            <p className="text-3xl font-bold mt-2">{totalRequests}</p>
            <p className="text-xs opacity-70 mt-1">Toàn bộ yêu cầu trên hệ thống</p>
          </div>
          <FontAwesomeIcon icon={faFileLines} className="w-6 h-6 opacity-40 shrink-0 mt-1" />
        </div>

        <div className="p-5 rounded-xl border bg-amber-50 text-amber-900 border-amber-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Đang chờ xử lý</p>
            <p className="text-3xl font-bold mt-2">{pendingCount || 0}</p>
            <p className="text-xs opacity-70 mt-1">Đơn cần các cấp phê duyệt</p>
          </div>
          <FontAwesomeIcon icon={faClock} className="w-6 h-6 opacity-40 shrink-0 mt-1" />
        </div>

        <div className="p-5 rounded-xl border bg-blue-50 text-blue-900 border-blue-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Tài khoản hoạt động</p>
            <p className="text-3xl font-bold mt-2">{activeUsers}</p>
            <p className="text-xs opacity-70 mt-1">Thành viên trong doanh nghiệp</p>
          </div>
          <FontAwesomeIcon icon={faUsers} className="w-6 h-6 opacity-40 shrink-0 mt-1" />
        </div>

        <div className="p-5 rounded-xl border bg-emerald-50 text-emerald-900 border-emerald-200 flex items-start justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">Tỷ lệ duyệt thành công</p>
            <p className="text-3xl font-bold mt-2">{successRate}</p>
            <p className="text-xs opacity-70 mt-1">Đơn đã hoàn tất / đã xử lý</p>
          </div>
          <FontAwesomeIcon icon={faChartPie} className="w-6 h-6 opacity-40 shrink-0 mt-1" />
        </div>
      </div>

      {/* 1. Biểu đồ lượng đơn theo tuần/tháng (A.2) */}
      <RequestsTimeChart
        weeklyStats={weeklyStats || []}
        monthlyStats={monthlyStats || []}
      />

      {/* 2 & 3. Biểu đồ Tỷ lệ loại đơn & Số tài khoản theo phòng ban (A.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RequestTypesChart
          distribution={requestTypeDistribution || []}
          totalRequests={totalRequests || 0}
        />
        <DepartmentAccountsChart
          departments={departments || []}
          activeUsers={activeUsers || 0}
        />
      </div>
    </div>
  );
}
