export default function StatusBadge({ status }) {
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let dotStyle = "bg-slate-400";

  if (status === "Chờ duyệt") {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
    dotStyle = "bg-amber-500";
  } else if (status?.startsWith("Đang duyệt")) {
    badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
    dotStyle = "bg-blue-500";
  } else if (status === "Đã duyệt hoàn tất") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    dotStyle = "bg-emerald-500";
  } else if (status === "Bị từ chối") {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
    dotStyle = "bg-rose-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
      <span>{status || "Không xác định"}</span>
    </span>
  );
}
