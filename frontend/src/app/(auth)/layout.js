import Image from "next/image";
export const metadata = {
  title: "Xác thực tài khoản — Hệ Thống Duyệt Quy Trình",
};

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <Image
            src="/logo.png"
            alt="Logo"
            width={52}
            height={52}
            priority
            unoptimized
            className="mx-auto mb-3 rounded-xl shadow-xs"
          />
          <h1 className="text-2xl font-bold text-slate-800">
            Hệ Thống Duyệt Quy Trình
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nền tảng số hóa phê duyệt nội bộ
          </p>
        </div>
        {/* Login và Register */}
        {children}
      </div>
    </div>
  );
}
