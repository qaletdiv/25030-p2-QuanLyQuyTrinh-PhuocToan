import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestDetailApi } from "@/services/requests.api";
import StatusBadge from "@/components/StatusBadge";
import ApprovalStepper from "@/components/ApprovalStepper";
import ApprovalLogs from "@/components/ApprovalLogs";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: `Chi tiết đơn ${resolvedParams.id} | Hệ Thống Quản Lý Quy Trình`,
  };
}

export default async function RequestDetailPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let request = null;
  try {
    request = await getRequestDetailApi(id);
  } catch (err) {
    notFound();
  }

  const { formData, attachments, flow, logs, requestType, creator, handoverUser } = request;

  const dateCreated = request.createdAt
    ? new Date(request.createdAt).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2 cursor-pointer"
          >
            <span>←</span>
            <span>Quay lại danh sách đơn</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {request.id}
            </h1>
            <span className="text-xl text-slate-300">|</span>
            <span className="text-lg font-semibold text-slate-700">
              {request.requestTypeName}
            </span>
            <StatusBadge status={request.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tạo lúc: {dateCreated} • Người tạo: {creator?.name || "Bạn"} ({creator?.department || "Bộ phận"})
          </p>
        </div>
      </div>

      {/* Card 1: Tiến trình phê duyệt (Stepper) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Tiến trình phê duyệt
          </h2>
          <span className="text-xs text-slate-400">
            Trạng thái hiện tại: <strong className="text-slate-700">{request.status}</strong>
          </span>
        </div>
        <ApprovalStepper
          flow={flow}
          currentStatus={request.status}
          currentLevel={request.currentLevel}
          logs={logs}
        />
      </div>

      {/* Card 2: Nội dung chi tiết đơn đã điền */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
          Nội dung đơn yêu cầu
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Loại nghỉ phép
            </span>
            <span className="font-medium text-slate-800">
              {formData?.leaveType || "—"}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Người bàn giao công việc
            </span>
            <span className="font-medium text-slate-800">
              {handoverUser ? `${handoverUser.name} (${handoverUser.email})` : "—"}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Thời gian nghỉ
            </span>
            <span className="font-medium text-slate-800">
              {formData?.startDate} → {formData?.endDate}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Tổng số ngày nghỉ
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {formData?.totalDays} ngày
            </span>
          </div>

          <div className="md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Lý do xin nghỉ
            </span>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
              {formData?.reason || "Không có lý do cụ thể"}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="md:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Tệp đính kèm ({attachments?.length || 0})
            </span>
            {attachments && attachments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-8 h-8 rounded bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        📎
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {file.size || "Tệp tài liệu"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 hover:text-blue-800 shrink-0 cursor-pointer">
                      Xem tệp
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Không có tệp đính kèm nào được tải lên.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Nhật ký phê duyệt các cấp */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Nhật ký ý kiến phê duyệt
          </h2>
          <span className="text-xs text-slate-400">
            {logs?.length || 0} lượt phản hồi
          </span>
        </div>
        <ApprovalLogs logs={logs} />
      </div>
    </div>
  );
}

