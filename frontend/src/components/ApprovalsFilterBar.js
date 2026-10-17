"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export default function ApprovalsFilterBar({
  pendingCount = 0,
  historyCount = 0,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTab = searchParams.get("tab") || "pending";
  const currentSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(currentSearch);

  const handleTabSwitch = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleResetSearch = () => {
    setSearch("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-100">
        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabSwitch("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentTab === "pending"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Cần bạn xử lý</span>
            {pendingCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "pending"
                    ? "bg-white text-blue-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentTab === "history"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>Lịch sử đã xử lý</span>
            {historyCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  currentTab === "history"
                    ? "bg-white text-blue-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Search form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm mã đơn, tên, loại đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {isPending ? "Đang tìm..." : "Tìm"}
          </button>
          {currentSearch && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Hủy tìm
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
