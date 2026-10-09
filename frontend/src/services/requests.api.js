import { cookies } from "next/headers";

const BASE_URL = process.env.API_URL || "http://localhost:5000";

// Tạo đơn mới
export const createRequestApi = async (requestData) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Tạo đơn thất bại");
  }
  return data;
};

// Lấy danh sách đơn của chính người dùng (kèm bộ lọc)
export const getMyRequestsApi = async ({ status, startDate, endDate, search } = {}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const params = new URLSearchParams();
  if (status && status !== "ALL") params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (search) params.append("search", search);

  const queryString = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`${BASE_URL}/api/requests/my${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách đơn của bạn");
  }
  return data;
};

// Lấy thông tin chi tiết một đơn (kèm tiến trình duyệt và nhật ký)
export const getRequestDetailApi = async (id) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/requests/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải thông tin chi tiết đơn");
  }
  return data;
};
