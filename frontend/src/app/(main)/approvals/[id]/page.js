import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestDetailApi } from "@/services/requests.api";
import { getMeApi } from "@/services/auth.api";
import StatusBadge from "@/components/StatusBadge";
import ApprovalStepper from "@/components/ApprovalStepper";
import ApprovalLogs from "@/components/ApprovalLogs";
import ApprovalActionCard from "@/components/ApprovalActionCard";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: `Xét duyệt đơn ${resolvedParams.id} | Hệ Thống Quản Lý Quy Trình`,
  };
}

export default async function ApprovalDetailPage({ params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let request = null;
  let currentUser = null;

  try {
    [request, currentUser] = await Promise.all([
      getRequestDetailApi(id),
      getMeApi(),
    ]);
  } catch (err) {
    notFound();
  }

  const { formData, attachments, flow, logs, creator, handoverUser } = request;

  // Xác định thẩm quyền xử lý tại bước hiện tại
  let canApprove = false;
  if (currentUser?.role === "admin") {
    canApprove = true;
  } else if (currentUser?.role === "approver") {
    const isFinished = request.status === "Đã duyệt hoàn tất" || request.status === "Bị từ chối";
    if (!isFinished) {
      const currentLvl = request.currentLevel || 1;
      const currentStep = flow?.find((s) => s.level === currentLvl);

      if (currentStep?.level === 1) {
        // Cấp 1 (Trưởng phòng): Trưởng phòng cùng phòng ban với người tạo đơn
        canApprove = currentUser.department === creator?.department;
      } else if (currentStep?.level === 2 && request.requestTypeId === "rt-leave") {
        // Cấp 2 (HR): Cán bộ phòng Nhân sự
        canApprove = currentUser.department === "Nhân sự & Hành chính";
      } else {
        canApprove = true;
      }
    }
  }

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
      <div>
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2 cursor-pointer"
        >
          <span>←</span>
          <span>Quay lại danh sách duyệt đơn</span>
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
          Người gửi: <strong className="text-slate-700">{creator?.name}</strong> ({creator?.department}) • Tạo lúc: {dateCreated}
        </p>
      </div>

      {/* Card 1: Khu vực Ra Quyết Định Phê Duyệt / Từ Chối */}
      <ApprovalActionCard
        requestId={request.id}
        currentStatus={request.status}
        canApprove={canApprove}
      />

      {/* Card 2: Tiến trình phê duyệt (Stepper) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Tiến trình phê duyệt quy trình
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

      {/* Card 3: Chi tiết nội dung đơn */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
          Nội dung đơn cần thẩm định
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
              Người nhận bàn giao công việc
            </span>
            <span className="font-medium text-slate-800">
              {handoverUser ? `${handoverUser.name} (${handoverUser.email})` : "—"}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Thời gian xin nghỉ
            </span>
            <span className="font-medium text-slate-800">
              {formData?.startDate} → {formData?.endDate}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Tổng số ngày nghỉ đề xuất
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {formData?.totalDays} ngày
            </span>
          </div>

          <div className="md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Lý do chi tiết
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
                Không có tệp đính kèm.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card 4: Lịch sử & Ý kiến phê duyệt */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Nhật ký ý kiến các cấp duyệt
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

