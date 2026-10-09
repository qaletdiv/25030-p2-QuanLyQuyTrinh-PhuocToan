import {
  getRequestTypesApi,
  getColleaguesApi,
} from "@/services/requestTypes.api";
import DynamicRequestForm from "@/components/DynamicRequestForm";

export const metadata = {
  title: "Tạo đơn mới — Hệ Thống Duyệt Quy Trình",
};

export default async function NewRequestPage() {
  // Lấy dữ liệu schema loại đơn và đồng nghiệp ngay tại Server
  const [requestTypes, colleagues] = await Promise.all([
    getRequestTypesApi().catch(() => []),
    getColleaguesApi().catch(() => []),
  ]);

  return (
    <DynamicRequestForm requestTypes={requestTypes} colleagues={colleagues} />
  );
}
