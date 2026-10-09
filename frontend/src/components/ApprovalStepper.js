export default function ApprovalStepper({ flow = [], currentStatus, currentLevel = 1, logs = [] }) {
  if (!flow || flow.length === 0) {
    return (
      <div className="text-sm text-slate-500 italic py-4">
        Không có cấu hình bước duyệt cho loại đơn này.
      </div>
    );
  }

  // Xác định xem đơn đã bị từ chối ở bước nào chưa
  const rejectLog = logs.find((l) => l.action === "reject");
  const rejectedLevel = rejectLog ? rejectLog.level : null;

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-0 relative">
        {flow.map((step, index) => {
          const isLast = index === flow.length - 1;
          const approveLog = logs.find((l) => l.level === step.level && l.action === "approve");
          const stepRejectLog = logs.find((l) => l.level === step.level && l.action === "reject");

          let stepState = "pending"; // 'done', 'current', 'rejected', 'upcoming', 'stopped'

          if (approveLog) {
            stepState = "done";
          } else if (stepRejectLog) {
            stepState = "rejected";
          } else if (rejectedLevel && step.level > rejectedLevel) {
            stepState = "stopped";
          } else if (
            currentStatus === "Đã duyệt hoàn tất" ||
            (currentStatus === "Chờ duyệt" && step.level === 1) ||
            currentStatus === `Đang duyệt cấp ${step.level}`
          ) {
            stepState = "current";
          } else {
            stepState = "upcoming";
          }

          // Indicator style
          let circleClasses = "bg-slate-100 text-slate-500 border-2 border-slate-300";
          let labelBadgeClasses = "text-slate-600 bg-slate-100";
          let statusText = "Chưa đến lượt";

          if (stepState === "done") {
            circleClasses = "bg-emerald-600 text-white border-2 border-emerald-600 shadow-sm";
            labelBadgeClasses = "text-emerald-700 bg-emerald-50 border border-emerald-200";
            statusText = "Đã phê duyệt";
          } else if (stepState === "rejected") {
            circleClasses = "bg-rose-600 text-white border-2 border-rose-600 shadow-sm";
            labelBadgeClasses = "text-rose-700 bg-rose-50 border border-rose-200";
            statusText = "Từ chối";
          } else if (stepState === "current") {
            circleClasses = "bg-blue-600 text-white border-2 border-blue-600 shadow-md ring-4 ring-blue-100";
            labelBadgeClasses = "text-blue-700 bg-blue-50 border border-blue-200 font-semibold";
            statusText = "Đang chờ duyệt";
          } else if (stepState === "stopped") {
            circleClasses = "bg-slate-100 text-slate-400 border-2 border-slate-200";
            labelBadgeClasses = "text-slate-400 bg-slate-50";
            statusText = "Đã dừng";
          }

          // Next line connector style
          const nextStepDone = approveLog !== undefined;

          return (
            <div
              key={step.level}
              className="flex-1 flex flex-row md:flex-col items-center md:text-center w-full relative group"
            >
              {/* Connector line for desktop */}
              {!isLast && (
                <div
                  className={`hidden md:block absolute top-5 left-1/2 w-full h-0.5 -z-10 transition-colors ${
                    nextStepDone ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}

              {/* Step Circle Indicator */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${circleClasses}`}
                >
                  {stepState === "done" ? (
                    <span className="text-base leading-none">✓</span>
                  ) : stepState === "rejected" ? (
                    <span className="text-base leading-none">✕</span>
                  ) : (
                    <span>{step.level}</span>
                  )}
                </div>
              </div>

              {/* Step Info */}
              <div className="ml-4 md:ml-0 md:mt-3 flex flex-col md:items-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Bước {step.level}
                </span>
                <span className="text-sm font-semibold text-slate-800 mt-0.5">
                  {step.title}
                </span>
                <span
                  className={`inline-block text-[11px] px-2 py-0.5 rounded-full mt-1.5 ${labelBadgeClasses}`}
                >
                  {statusText}
                </span>

                {/* Approver log details if available */}
                {(approveLog || stepRejectLog) && (
                  <div className="mt-1.5 text-xs text-slate-500 md:text-center">
                    <p className="font-medium text-slate-700">
                      {approveLog?.approverName || stepRejectLog?.approverName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(
                        (approveLog || stepRejectLog).timestamp
                      ).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

