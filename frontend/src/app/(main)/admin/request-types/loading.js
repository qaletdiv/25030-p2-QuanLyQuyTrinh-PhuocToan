export default function AdminRequestTypesLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-72 bg-slate-100 rounded-md"></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-6 space-y-4">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-12 bg-slate-100 rounded"></div>
        <div className="h-12 bg-slate-100 rounded"></div>
        <div className="h-12 bg-slate-100 rounded"></div>
      </div>
    </div>
  );
}
