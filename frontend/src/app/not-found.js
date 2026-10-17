import Link from "next/link";

export const metadata = {
  title: "404 - Không tìm thấy trang | Hệ Thống Quản Lý Quy Trình",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <span className="text-6xl font-black text-blue-600 tracking-tight block">
            404
          </span>
          <h1 className="text-xl font-bold text-slate-800">
            Không tìm thấy trang
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Đường dẫn bạn đang truy cập không thuộc bất kỳ phân đoạn nào trong
            hệ thống, hoặc trang này đã bị di chuyển.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="pt-2">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-5 rounded-xl shadow-xs transition-all hover:shadow cursor-pointer"
          >
            <span>← Quay về trang chủ</span>
          </Link>
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-6">
        Hệ Thống Quản Lý Và Duyệt Quy Trình Doanh Nghiệp
      </p>
    </div>
  );
}
