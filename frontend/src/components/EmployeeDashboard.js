import Link from "next/link";
import { getMyRequestsApi } from "@/services/requests.api";
import StatusBadge from "@/components/StatusBadge";

export default async function EmployeeDashboard() {
  let requests = [];
  try {
    requests = await getMyRequestsApi();
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu Employee Dashboard:", err);
  }

  // Tính toán số liệu thống kê thời gian thực từ dữ liệu đơn của nhân viên
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === "Chờ duyệt" || r.status.startsWith("Đang duyệt"),
  ).length;
  const approvedCount = requests.filter(
    (r) => r.status === "Đã duyệt hoàn tất",
  ).length;

  const stats = [
    {
      title: "Tổng đơn của bạn",
      value: totalCount,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      description: "Tất cả các đơn đã gửi",
    },
    {
      title: "Đang chờ duyệt",
      value: pendingCount,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      description: "Chờ phê duyệt ở các cấp",
    },
    {
      title: "Đã duyệt hoàn tất",
      value: approvedCount,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description: "Được chấp thuận hoàn tất",
    },
  ];

  // 5 Đơn gần nhất
  const recentRequests = requests.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 3 Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.title} className={`p-5 rounded-xl border ${s.color}`}>
            <p className="text-sm font-medium opacity-80">{s.title}</p>
            <p className="text-3xl font-bold mt-2">{s.value}</p>
            <p className="text-xs opacity-70 mt-1">{s.description}</p>
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
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Xem tất cả ({totalCount}) →
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
