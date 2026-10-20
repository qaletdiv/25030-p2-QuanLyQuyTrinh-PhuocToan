import Link from "next/link";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faClipboardList,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { getMeApi } from "@/services/auth.api";
import { getApprovalsApi } from "@/services/approvals.api";
import StatusBadge from "@/components/StatusBadge";
import ApprovalsFilterBar from "@/components/ApprovalsFilterBar";

export const metadata = {
  title: "Danh sách duyệt đơn | Hệ Thống Quản Lý Quy Trình",
};

export default async function ApprovalsPage({ searchParams }) {
  const user = await getMeApi();
  if (user?.role !== "approver" && user?.role !== "admin") {
    redirect("/dashboard");
  }
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams?.tab || "pending";
  const currentSearch = resolvedSearchParams?.search || "";

  let approvalsData = {
    pending: [],
    history: [],
    counts: { pending: 0, history: 0 },
  };
  let errorMsg = null;

  try {
    approvalsData = await getApprovalsApi({
      tab: currentTab,
      search: currentSearch,
    });
  } catch (err) {
    errorMsg = err.message || "Không thể tải danh sách duyệt đơn";
  }

  const { pending, history, counts } = approvalsData;
  const currentList = currentTab === "history" ? history : pending;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Danh sách duyệt đơn
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Xem xét, phê duyệt hoặc từ chối các quy trình yêu cầu theo đúng thẩm
          quyền được giao
        </p>
      </div>

      {/* 2 Thẻ thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border bg-amber-50/80 border-amber-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Đơn đang chờ bạn xử lý
          </p>
          <p className="text-3xl font-extrabold text-amber-900 mt-2">
            {counts?.pending || 0}
          </p>
          <p className="text-xs text-amber-700/80 mt-1">
            Các đơn đang ở đúng cấp duyệt của bạn
          </p>
        </div>

        <div className="p-5 rounded-xl border bg-blue-50/80 border-blue-200 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
            Đơn bạn đã xử lý
          </p>
          <p className="text-3xl font-extrabold text-blue-900 mt-2">
            {counts?.history || 0}
          </p>
          <p className="text-xs text-blue-700/80 mt-1">
            Lịch sử các quyết định duyệt / từ chối của bạn
          </p>
        </div>
      </div>

      {/* Filter Bar with Tabs & Search */}
      <ApprovalsFilterBar
        pendingCount={counts?.pending || 0}
        historyCount={counts?.history || 0}
      />

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {currentList.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FontAwesomeIcon
                icon={currentTab === "pending" ? faCheck : faClipboardList}
                className="w-6 h-6"
              />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {currentTab === "pending"
                ? "Không có đơn nào cần xử lý lúc này"
                : "Chưa có lịch sử xử lý đơn"}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {currentTab === "pending"
                ? "Tuyệt vời! Bạn đã hoàn tất tất cả các đơn thuộc thẩm quyền của mình."
                : "Các đơn bạn phê duyệt hoặc từ chối sẽ hiển thị tại đây."}
            </p>
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
                    Người tạo
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Loại đơn
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Ngày gửi
                  </th>
                  <th scope="col" className="px-6 py-3.5">
                    Bước hiện tại
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
                {currentList.map((item) => {
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
                          href={`/approvals/${item.id}`}
                          className="hover:underline"
                        >
                          {item.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {item.creator?.name || "Nhân viên"}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.creator?.department || "Bộ phận"}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.requestTypeName || item.requestTypeId}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{dateStr}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {item.currentStepTitle}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/approvals/${item.id}`}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                            currentTab === "pending"
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                              : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          }`}
                        >
                          <span>
                            {currentTab === "pending"
                              ? "Xử lý ngay"
                              : "Xem chi tiết"}
                          </span>
                          <FontAwesomeIcon icon={faArrowRight} className="w-2.5 h-2.5" />
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
