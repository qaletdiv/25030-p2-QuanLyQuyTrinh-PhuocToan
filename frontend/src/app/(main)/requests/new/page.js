import {
  getRequestTypesApi,
  getColleaguesApi,
} from "@/services/requestTypes.api";
import DynamicRequestForm from "@/components/DynamicRequestForm";

export const metadata = {
  title: "Tạo đơn mới — Hệ Thống Duyệt Quy Trình",
};

export default async function NewRequestPage() {
  let requestTypes = [];
  let colleagues = [];
  let errorMsg = null;

  try {
    const [types, colls] = await Promise.all([
      getRequestTypesApi(),
      getColleaguesApi(),
    ]);
    requestTypes = types;
    colleagues = colls;
  } catch (err) {
    errorMsg = err.message || "Không thể tải danh mục loại đơn hoặc danh sách nhân sự. Vui lòng kiểm tra kết nối.";
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-xl flex items-center gap-2.5 shadow-xs max-w-4xl mx-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <DynamicRequestForm requestTypes={requestTypes} colleagues={colleagues} />
    </div>
  );
}
