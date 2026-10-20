import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function ApprovalLogs({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
        Chưa có ý kiến hay nhật ký phê duyệt nào cho đơn này.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const isApproved = log.action === "approve";
        const dateFormatted = log.timestamp
          ? new Date(log.timestamp).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";

        return (
          <div
            key={log.id || `${log.level}-${log.timestamp}`}
            className={`border rounded-xl p-4 transition-all ${
              isApproved
                ? "bg-emerald-50/50 border-emerald-200"
                : "bg-rose-50/50 border-rose-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isApproved ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <span className="font-semibold text-slate-800 text-sm">
                  {log.approverName || "Người duyệt"}
                </span>
                <span className="text-xs text-slate-400">
                  (Cấp {log.level})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    isApproved
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isApproved ? faCircleCheck : faCircleXmark}
                    className="w-3 h-3"
                  />
                  <span>{isApproved ? "Đã phê duyệt" : "Đã từ chối"}</span>
                </span>
                <span className="text-xs text-slate-400">{dateFormatted}</span>
              </div>
            </div>

            {/* Note / Reason */}
            <div className="mt-3 text-sm text-slate-700">
              <span className="font-medium text-xs uppercase tracking-wider text-slate-400 block mb-1">
                {isApproved ? "Ý kiến phê duyệt:" : "Lý do từ chối:"}
              </span>
              <p className="bg-white p-3 rounded-lg border border-slate-100 italic">
                "{log.note || "Không có ghi chú thêm."}"
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
