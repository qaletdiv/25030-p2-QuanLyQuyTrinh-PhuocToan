"use client";

import { useActionState, useState } from "react";
import { approveRequestAction, rejectRequestAction } from "@/actions/approvals.actions";

export default function ApprovalActionCard({ requestId, currentStatus, canApprove = true }) {
  const [activeAction, setActiveAction] = useState("approve"); // 'approve' | 'reject'
  const [clientError, setClientError] = useState("");

  const [approveState, approveActionDispatch, isApproving] = useActionState(
    approveRequestAction,
    { success: false, error: null }
  );

  const [rejectState, rejectActionDispatch, isRejecting] = useActionState(
    rejectRequestAction,
    { success: false, error: null }
  );

  const isCompleted = currentStatus === "Đã duyệt hoàn tất" || currentStatus === "Bị từ chối";

  // Nếu đơn đã kết thúc xử lý
  if (isCompleted) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <span className="inline-block w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold leading-8 mb-2">
          ✓
        </span>
        <h3 className="text-sm font-bold text-slate-800">
          Đơn này đã kết thúc xử lý
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Trạng thái hiện tại: <strong className="text-slate-700">{currentStatus}</strong>. Không thể thực hiện thêm thao tác phê duyệt.
        </p>
      </div>
    );
  }

  // Nếu user không có quyền xử lý ở bước này
  if (!canApprove) {
    return (
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 text-center text-amber-800">
        <h3 className="text-sm font-bold">
          Chưa đến cấp của bạn hoặc bạn không có thẩm quyền xử lý bước này
        </h3>
        <p className="text-xs text-amber-700/80 mt-1">
          Đơn đang ở trạng thái: <strong>{currentStatus}</strong>.
        </p>
      </div>
    );
  }

  const handleRejectSubmit = (e) => {
    setClientError("");
    const form = e.currentTarget;
    const reason = form.elements.namedItem("reason")?.value;
    if (!reason || !reason.trim()) {
      e.preventDefault();
      setClientError("Bắt buộc phải nhập lý do từ chối theo yêu cầu nghiệp vụ!");
    }
  };

  return (
    <div className="bg-white border-2 border-blue-500/30 rounded-xl p-6 shadow-md">
      <div className="border-b border-slate-100 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Khu vực xử lý phê duyệt
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bạn có thẩm quyền xem xét và ra quyết định đối với đơn yêu cầu này.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveAction("approve");
              setClientError("");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAction === "approve"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ✓ Duyệt đơn
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveAction("reject");
              setClientError("");
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeAction === "reject"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ✕ Từ chối đơn
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {approveState?.error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{approveState.error}</span>
        </div>
      )}

      {rejectState?.error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{rejectState.error}</span>
        </div>
      )}

      {clientError && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{clientError}</span>
        </div>
      )}

      {approveState?.success && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>{approveState.message || "Phê duyệt đơn thành công!"}</span>
        </div>
      )}

      {rejectState?.success && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{rejectState.message || "Đã từ chối đơn thành công!"}</span>
        </div>
      )}

      {/* Form Phê duyệt */}
      {activeAction === "approve" && (
        <form action={approveActionDispatch} className="space-y-4">
          <input type="hidden" name="requestId" value={requestId} />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ý kiến / Ghi chú phê duyệt (tùy chọn)
            </label>
            <textarea
              name="note"
              rows={3}
              placeholder="Nhập ghi chú hoặc dặn dò nhân viên (nếu có)..."
              disabled={isApproving}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isApproving}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isApproving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Xác nhận Phê duyệt đơn</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Form Từ chối */}
      {activeAction === "reject" && (
        <form
          action={rejectActionDispatch}
          onSubmit={handleRejectSubmit}
          className="space-y-4"
        >
          <input type="hidden" name="requestId" value={requestId} />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý do từ chối <span className="text-rose-500">* (Bắt buộc theo quy định)</span>
            </label>
            <textarea
              name="reason"
              rows={3}
              placeholder="Ghi rõ lý do tại sao từ chối đơn này..."
              required
              disabled={isRejecting}
              className="w-full px-3 py-2 text-sm border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isRejecting}
              className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isRejecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>✕</span>
                  <span>Xác nhận Từ chối đơn</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

