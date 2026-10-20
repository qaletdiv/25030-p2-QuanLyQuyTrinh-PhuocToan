export default function NewRequestLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-2">
        <div className="h-4 w-32 bg-slate-100 rounded"></div>
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-96 bg-slate-100 rounded"></div>
      </div>

      {/* Form skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-slate-200 rounded"></div>
          <div className="h-11 bg-slate-100 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-11 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-11 bg-slate-100 rounded-xl"></div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-100 rounded-xl"></div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <div className="h-10 w-24 bg-slate-100 rounded-xl"></div>
          <div className="h-10 w-36 bg-blue-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
