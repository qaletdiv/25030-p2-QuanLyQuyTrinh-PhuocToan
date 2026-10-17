"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MainError({ error, reset }) {
  useEffect(() => {
    console.error("Lỗi trong phân hệ chính:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="w-14 h-14 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold shadow-xs">
          !
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800">
            Không thể tải dữ liệu trang này
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Đã có sự cố khi kết nối tới máy chủ hoặc xử lý dữ liệu của bạn.
          </p>
        </div>

        {error?.message && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-mono break-words text-left">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
          >
            Thử lại
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          >
            Quay về trang tổng quan
          </Link>
        </div>
      </div>
    </div>
  );
}

