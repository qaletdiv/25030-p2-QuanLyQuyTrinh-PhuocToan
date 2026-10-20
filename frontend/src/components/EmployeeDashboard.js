import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faClock,
  faCircleCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { getMyRequestsApi } from "@/services/requests.api";
import StatusBadge from "@/components/StatusBadge";

export default async function EmployeeDashboard() {
  let requests = [];
  let errorMsg = null;

  try {
    requests = await getMyRequestsApi();
  } catch (err) {
    errorMsg = err.message || "Không thể tải dữ liệu hoạt động của nhân viên. Vui lòng kiểm tra kết nối.";
  }

  // Tính toán số liệu thống kê thời gian thực từ dữ liệu đơn của nhân viên (A.2)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "Chờ duyệt" || r.status.startsWith("Đang duyệt"),
  ).length;

  // Đơn được duyệt trong tháng hiện tại
  const approvedThisMonth = requests.filter((r) => {
    if (r.status !== "Đã duyệt hoàn tất") return false;
    const d = new Date(r.updatedAt || r.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const stats = [
    {
      title: "Tổng đơn đã gửi",
      value: totalCount,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Tất cả các đơn bạn đã tạo",
      icon: faFileLines,
    },
    {
      title: "Đang chờ duyệt",
      value: pendingCount,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Chờ phê duyệt ở các cấp",
      icon: faClock,
    },
    {
      title: "Duyệt trong tháng",
      value: approvedThisMonth,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: `Đã phê duyệt trong Tháng ${currentMonth + 1}/${currentYear}`,
      icon: faCircleCheck,
    },
  ];

  // 5 Đơn gần nhất (Sắp xếp giảm dần theo thời gian tạo thực tế)
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const recentRequests = sortedRequests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Banner thông báo lỗi nếu tải dữ liệu thất bại */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl flex items-center gap-2.5 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* 3 Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.title} className={`p-5 rounded-xl border flex items-start justify-between ${s.color}`}>
            <div>
              <p className="text-sm font-medium opacity-80">{s.title}</p>
              <p className="text-3xl font-bold mt-2">{s.value}</p>
              <p className="text-xs opacity-70 mt-1">{s.description}</p>
            </div>
            <FontAwesomeIcon icon={s.icon} className="w-6 h-6 opacity-40 shrink-0 mt-1" />
          </div>
        ))}
      </div>

      {/* 5 Đơn gần nhất */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            5 Đơn gần nhất của bạn
          </h2>
          <Link
            href="/requests"
            className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1.5"
          >
            <span>Xem tất cả ({totalCount})</span>
            <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            Bạn chưa có đơn yêu cầu nào. Nhấn{" "}
            <Link href="/requests/new" className="text-blue-600 font-semibold underline">
              Tạo đơn mới
            </Link>{" "}
            để gửi đơn đề xuất đầu tiên.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Loại đơn</th>
                  <th className="py-3 px-4">Ngày tạo</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((r) => {
                  const dateFormatted = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("vi-VN")
                    : "—";
                  const typeName =
                    r.requestTypeName ||
                    (r.requestTypeId === "rt-purchase"
                      ? "Đơn mua hàng"
                      : "Đơn nghỉ phép");

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {r.id}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {typeName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {dateFormatted}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/requests/${r.id}`}
                          className="text-blue-600 hover:underline text-xs font-semibold"
                        >
                          Xem →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
