import Link from "next/link";
import { getApprovalsApi } from "@/services/approvals.api";
import StatusBadge from "@/components/StatusBadge";

export default async function ApproverDashboard() {
  let pendingList = [];
  let counts = { pending: 0, history: 0 };

  try {
    const data = await getApprovalsApi({ tab: "pending" });
    pendingList = data.pending || [];
    counts = data.counts || { pending: 0, history: 0 };
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu Approver Dashboard:", err);
  }

  // Lấy tối đa 5 đơn mới nhất cần xử lý
  const displayApprovals = pendingList.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border bg-amber-50 text-amber-800 border-amber-200">
          <p className="text-sm font-medium opacity-80">
            Đơn đang chờ bạn duyệt
          </p>
          <p className="text-3xl font-bold mt-2">{counts.pending}</p>
        </div>
        <div className="p-5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200">
          <p className="text-sm font-medium opacity-80">
            Bạn đã phê duyệt / xử lý
          </p>
          <p className="text-3xl font-bold mt-2">{counts.history}</p>
        </div>
      </div>

      {/* Danh sách 5 đơn mới nhất cần xử lý */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            Đơn chờ bạn xử lý
          </h2>
          <Link
            href="/approvals"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Xem toàn bộ hàng đợi ({counts.pending}) →
          </Link>
        </div>

        {displayApprovals.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Hiện tại không có đơn nào đang chờ bạn xử lý.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Người gửi</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Loại đơn</th>
                  <th className="py-3 px-4">Ngày gửi</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayApprovals.map((item) => {
                  const dateFormatted = item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                    : "—";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {item.creator?.name || "Nhân viên"}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {item.creator?.department || "Bộ phận"}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.requestTypeName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{dateFormatted}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/approvals/${item.id}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer inline-block"
                        >
                          Xử lý ngay →
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
