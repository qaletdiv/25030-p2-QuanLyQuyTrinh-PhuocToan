import { redirect } from "next/navigation";
import { getMeApi } from "@/services/auth.api";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function MainLayout({ children }) {
  // Lấy thông tin user ngay tại server
  const user = await getMeApi();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
