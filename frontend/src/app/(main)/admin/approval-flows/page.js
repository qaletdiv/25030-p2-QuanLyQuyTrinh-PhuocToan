import { redirect } from "next/navigation";
import { getMeApi } from "@/services/auth.api";
import {
  getAdminApprovalFlowsApi,
  getAdminRequestTypesApi,
} from "@/services/admin.api";
import ApprovalFlowConfigurator from "@/components/ApprovalFlowConfigurator";

export const metadata = {
  title: "Cấu hình luồng duyệt | Quản trị hệ thống",
};

export default async function AdminApprovalFlowsPage() {
  const user = await getMeApi();
  if (user?.role !== "admin") {
    redirect(user?.role === "approver" ? "/approvals" : "/dashboard");
  }

  let flows = [];
  let types = [];
  let errorMsg = null;

  try {
    [flows, types] = await Promise.all([
      getAdminApprovalFlowsApi(),
      getAdminRequestTypesApi(),
    ]);
  } catch (err) {
    errorMsg = err.message || "Không thể tải cấu hình luồng duyệt";
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Cấu hình luồng duyệt & điều kiện rẽ nhánh
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Thiết lập số cấp duyệt, đối tượng phê duyệt cho từng loại đơn và các
          điều kiện rẽ nhánh tự động (Mục 5 Nghiệp vụ)
        </p>
      </div>

      {errorMsg ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : (
        <ApprovalFlowConfigurator initialFlows={flows} types={types} />
      )}
    </div>
  );
}
