import Link from "next/link";
import { getMyRequestsApi } from "@/services/requests.api";
import StatusBadge from "@/components/StatusBadge";
import RequestFilterBar from "@/components/RequestFilterBar";

export const metadata = {
  title: "Đơn của tôi | Hệ Thống Quản Lý Quy Trình",
};

export default async function MyRequestsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { status, startDate, endDate, search } = resolvedSearchParams || {};

  let requests = [];
  let errorMsg = null;

  try {
    requests = await getMyRequestsApi({ status, startDate, endDate, search });
  } catch (err) {
    errorMsg = err.message || "Không thể tải danh sách đơn";
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Đơn của tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến trình phê duyệt và lịch sử các yêu cầu bạn đã gửi
          </p>
        </div>

        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all hover:shadow cursor-pointer shrink-0"
        >
          <span className="text-base font-bold leading-none">+</span>
          <span>Tạo đơn mới</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <RequestFilterBar />

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400 font-bold text-lg">
              📄
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              Chưa có đơn yêu cầu nào
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
              Bạn chưa gửi đơn nào hoặc không có đơn nào phù hợp với bộ lọc hiện tại.
            </p>
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <span>+ Tạo đơn mới ngay</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">
                    Mã đơn
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Loại đơn
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Ngày tạo
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((item) => {
                  const dateStr = item.createdAt
                    ? new Date(item.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-blue-600">
                        <Link
                          href={`/requests/${item.id}`}
                          className="hover:underline"
                        >
                          {item.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.requestTypeName || item.requestTypeId}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/requests/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          <span>Xem chi tiết</span>
                          <span className="text-sm">→</span>
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

