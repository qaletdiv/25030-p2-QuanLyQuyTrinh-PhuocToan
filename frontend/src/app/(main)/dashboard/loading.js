export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3"
          >
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-8 w-16 bg-slate-300 rounded"></div>
            <div className="h-3 w-40 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content / Table skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded"></div>
          <div className="h-4 w-24 bg-slate-100 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
