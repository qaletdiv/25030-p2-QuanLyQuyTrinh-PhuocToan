import "./globals.css";

export const metadata = {
  title: "Hệ Thống Duyệt Quy Trình",
  description: "Nền tảng số hóa phê duyệt nội bộ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
