export default function RequestDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      {/* Top navigation & title skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded"></div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-slate-300 rounded-lg"></div>
          <div className="h-6 w-4 bg-slate-200"></div>
          <div className="h-7 w-48 bg-slate-200 rounded"></div>
          <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
        </div>
        <div className="h-4 w-64 bg-slate-100 rounded"></div>
      </div>

      {/* Stepper skeleton */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
        <div className="flex items-center justify-between gap-4 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-16 bg-slate-200 rounded"></div>
                <div className="h-4 w-28 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="h-5 w-44 bg-slate-200 rounded pb-2 border-b border-slate-100"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b border-slate-50"
              >
                <div className="h-4 w-28 bg-slate-100 rounded"></div>
                <div className="h-4 w-44 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="h-5 w-36 bg-slate-200 rounded pb-2 border-b border-slate-100"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
