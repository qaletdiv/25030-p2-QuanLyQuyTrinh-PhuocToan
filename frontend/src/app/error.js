"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Lỗi hệ thống ghi nhận:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Biểu tượng lỗi Pure CSS */}
        <div className="w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
          !
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800">
            Đã xảy ra lỗi trong hệ thống
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống gặp sự cố ngoài dự kiến trong quá trình xử lý yêu cầu của bạn.
          </p>
        </div>

        {error?.message && (
          <div className="bg-rose-50/70 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-mono break-words text-left">
            {error.message}
          </div>
        )}

        {/* Nút thao tác */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-6">
        Hệ Thống Quản Lý Và Duyệt Quy Trình Doanh Nghiệp
      </p>
    </div>
  );
}

