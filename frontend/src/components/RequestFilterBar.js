"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

export default function RequestFilterBar({ availableStatuses = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || "ALL";
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";
  const currentSearch = searchParams.get("search") || "";

  const [search, setSearch] = useState(currentSearch);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  // ĐỒNG BỘ TRẠNG THÁI KHI URL THAY ĐỔI (Khắc phục lỗi Back/Forward của trình duyệt)
  useEffect(() => {
    setSearch(currentSearch);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
  }, [currentSearch, currentStartDate, currentEndDate]);

  const applyFilters = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(targetUrl);
    });
  };

  const handleStatusChange = (status) => {
    applyFilters({ status });
  };

  const handleDateFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search, startDate, endDate });
  };

  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  // Danh sách trạng thái động theo cấu hình cấp duyệt của các luồng (A.4)
  const statusesList =
    availableStatuses && availableStatuses.length > 0
      ? availableStatuses
      : ["Chờ duyệt", "Đang duyệt cấp 2", "Đã duyệt hoàn tất", "Bị từ chối"];

  const statusOptions = [
    { label: "Tất cả trạng thái", value: "ALL" },
    ...statusesList.map((st) => ({ label: st, value: st })),
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
      <form onSubmit={handleDateFilterSubmit} className="space-y-4">
        {/* Status Pills động theo cấu hình các cấp duyệt */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2">
            Trạng thái:
          </span>
          {statusOptions.map((opt) => {
            const isActive = currentStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Inputs: Search, Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Tìm theo mã đơn
            </label>
            <input
              type="text"
              placeholder="VD: REQ-001..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Từ ngày tạo
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Đến ngày tạo
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5" />
              <span>{isPending ? "Đang lọc..." : "Áp dụng lọc"}</span>
            </button>
            {(currentStatus !== "ALL" ||
              currentStartDate ||
              currentEndDate ||
              currentSearch) && (
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Xóa bộ lọc"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
