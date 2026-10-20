import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPaperclip } from "@fortawesome/free-solid-svg-icons";
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
  let errorMsg = null;

  try {
    [request, currentUser] = await Promise.all([
      getRequestDetailApi(id),
      getMeApi(),
    ]);
  } catch (err) {
    if (err.message && (err.message.includes("404") || err.message.toLowerCase().includes("không tìm thấy"))) {
      notFound();
    } else {
      errorMsg = err.message || "Không thể tải chi tiết đơn duyệt. Vui lòng kiểm tra kết nối mạng.";
    }
  }

  if (errorMsg || !request) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Link
          href="/approvals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
          <span>Quay lại danh sách duyệt</span>
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl flex items-center gap-2.5 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="font-medium">{errorMsg || "Không tìm thấy dữ liệu đơn duyệt"}</span>
        </div>
      </div>
    );
  }

  // Chuyển hướng theo vai trò: Nhân viên không được vào trang duyệt đơn
  if (currentUser?.role !== "approver" && currentUser?.role !== "admin") {
    redirect("/dashboard");
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
          <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
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

        {request.requestTypeId === "rt-purchase" || formData?.items ? (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Mục đích / Lý do mua sắm
                </span>
                <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {formData?.reason || "—"}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Tổng kinh phí đề xuất
                </span>
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-blue-700 font-medium">Tổng giá trị đơn</span>
                  <span className="text-lg font-extrabold text-blue-800">
                    {new Intl.NumberFormat("vi-VN").format(formData?.totalAmount || 0)} VNĐ
                  </span>
                </div>
              </div>
            </div>

            {/* Bảng danh sách sản phẩm */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                Bảng thẩm định danh mục vật tư đề xuất ({formData?.items?.length || 0} mục)
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Tên sản phẩm / Thiết bị</th>
                      <th className="py-2.5 px-3 w-24 text-center">Số lượng</th>
                      <th className="py-2.5 px-3 w-36 text-right">Đơn giá dự kiến</th>
                      <th className="py-2.5 px-3 w-36 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData?.items && Array.isArray(formData.items) ? (
                      formData.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {it.name}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-700">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">
                            {new Intl.NumberFormat("vi-VN").format(it.price || 0)} đ
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {new Intl.NumberFormat("vi-VN").format(it.amount || (it.quantity * it.price) || 0)} đ
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-3 px-3 text-center text-slate-400">
                          Chưa có thông tin sản phẩm
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50/80 font-bold text-slate-800 border-t border-slate-200">
                      <td colSpan={4} className="py-2.5 px-3 text-right">Tổng thanh toán:</td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-extrabold">
                        {new Intl.NumberFormat("vi-VN").format(formData?.totalAmount || 0)} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="pt-2 border-t border-slate-100">
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
                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.name}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 hover:underline"
                        >
                          Tải / Xem tệp
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                          Xem tệp
                        </span>
                      )}
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
        ) : (
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
                          <FontAwesomeIcon icon={faPaperclip} className="w-3.5 h-3.5" />
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
                      {file.url ? (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.name}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 shrink-0 hover:underline"
                        >
                          Tải / Xem tệp
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                          Xem tệp
                        </span>
                      )}
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
        )}
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

