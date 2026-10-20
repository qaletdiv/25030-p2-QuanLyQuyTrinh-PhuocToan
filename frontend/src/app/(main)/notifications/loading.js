export default function NotificationsLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-80 bg-slate-100 rounded"></div>
        </div>
        <div className="h-9 w-40 bg-slate-100 rounded-xl"></div>
      </div>

      {/* Tabs & Search skeleton */}
      <div className="flex justify-between items-center gap-3">
        <div className="h-10 w-64 bg-slate-100 rounded-xl"></div>
        <div className="h-10 w-56 bg-slate-100 rounded-xl"></div>
      </div>

      {/* List skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border-b border-slate-50"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/4 bg-slate-100 rounded"></div>
            </div>
            <div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
