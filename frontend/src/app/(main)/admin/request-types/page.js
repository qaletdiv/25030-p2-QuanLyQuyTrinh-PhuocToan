import { redirect } from "next/navigation";
import { getMeApi } from "@/services/auth.api";
import { getAdminRequestTypesApi } from "@/services/admin.api";
import RequestTypesManager from "@/components/RequestTypesManager";

export const metadata = {
  title: "Quản lý loại đơn | Quản trị hệ thống",
};

export default async function AdminRequestTypesPage() {
  const user = await getMeApi();
  if (user?.role !== "admin") {
    redirect(user?.role === "approver" ? "/approvals" : "/dashboard");
  }

  let types = [];
  let errorMsg = null;

  try {
    types = await getAdminRequestTypesApi();
  } catch (err) {
    errorMsg = err.message || "Không thể tải danh sách loại đơn";
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Quản lý loại đơn
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cấu hình danh mục các loại đơn phê duyệt trực tuyến, bật hoặc tạm ẩn
          mẫu đơn khỏi giao diện nhân viên
        </p>
      </div>

      {errorMsg ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : (
        <RequestTypesManager initialTypes={types} />
      )}
    </div>
  );
}
