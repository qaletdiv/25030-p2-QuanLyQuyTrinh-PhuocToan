import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export default function EmployeeDashboard() {
  const stats = [
    {
      title: "Tổng đơn trong tháng",
      value: "12",
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Đang chờ duyệt",
      value: "3",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Đã duyệt hoàn tất",
      value: "9",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  const recentRequests = [
    {
      id: "REQ-001",
      type: "Đơn nghỉ phép",
      date: "2026-10-01",
      status: "Chờ duyệt",
      color: "bg-amber-100 text-amber-700",
    },
    {
      id: "REQ-002",
      type: "Đơn mua hàng",
      date: "2026-09-28",
      status: "Đang duyệt cấp 2",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "REQ-003",
      type: "Đơn nghỉ phép",
      date: "2026-09-20",
      status: "Đã duyệt hoàn tất",
      color: "bg-emerald-100 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 3 Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.title} className={`p-5 rounded-xl border ${s.color}`}>
            <p className="text-sm font-medium opacity-80">{s.title}</p>
            <p className="text-3xl font-bold mt-2">{s.value}</p>
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
            Xem tất cả
          </Link>
        </div>
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
              {recentRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {r.id}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{r.type}</td>
                  <td className="py-3 px-4 text-slate-500">{r.date}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/requests/${r.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
