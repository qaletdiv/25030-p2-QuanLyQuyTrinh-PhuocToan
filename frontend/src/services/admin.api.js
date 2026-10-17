import { cookies } from "next/headers";

const BASE_URL = process.env.API_URL || "http://localhost:5000";

// Lấy danh sách toàn bộ loại đơn (bao gồm cả loại đơn đã ẩn)
export const getAdminRequestTypesApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/admin/request-types`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách loại đơn");
  }
  return data;
};

// Tạo loại đơn mới
export const createRequestTypeApi = async (typeData) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/admin/request-types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(typeData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Tạo loại đơn thất bại");
  }
  return data;
};

// Cập nhật loại đơn
export const updateRequestTypeApi = async (id, typeData) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/admin/request-types/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(typeData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Cập nhật loại đơn thất bại");
  }
  return data;
};

// Đổi trạng thái ẩn/hiện loại đơn
export const toggleRequestTypeApi = async (id) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${BASE_URL}/api/admin/request-types/${id}/toggle`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Thay đổi trạng thái thất bại");
  }
  return data;
};

// Xóa loại đơn
export const deleteRequestTypeApi = async (id) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/admin/request-types/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Xóa loại đơn thất bại");
  }
  return data;
};

// Lấy danh sách cấu hình luồng duyệt
export const getAdminApprovalFlowsApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/admin/approval-flows`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải cấu hình luồng duyệt");
  }
  return data;
};

// Cập nhật cấu hình luồng duyệt và điều kiện rẽ nhánh
export const updateApprovalFlowApi = async (requestTypeId, flowData) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(
    `${BASE_URL}/api/admin/approval-flows/${requestTypeId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(flowData),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Cập nhật cấu hình luồng duyệt thất bại");
  }
  return data;
};

// Lấy số liệu thống kê Dashboard Admin
export const getAdminDashboardStatsApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/admin/dashboard-stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải thống kê bảng điều khiển");
  }
  return data;
};
