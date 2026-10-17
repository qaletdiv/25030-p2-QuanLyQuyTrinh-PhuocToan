export default function ApprovalsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-72 bg-slate-100 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
        <div className="h-28 bg-white border border-slate-200 rounded-xl"></div>
      </div>

      <div className="h-16 bg-white border border-slate-200 rounded-xl"></div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-6 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}

