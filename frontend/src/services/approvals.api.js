import { cookies } from "next/headers";

const BASE_URL = process.env.API_URL || "http://localhost:5000";

// Lấy danh sách duyệt đơn của Approver (gồm pending và history)
export const getApprovalsApi = async ({ tab = "pending", search = "" } = {}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const params = new URLSearchParams();
  if (tab) params.append("tab", tab);
  if (search) params.append("search", search);

  const queryString = params.toString() ? `?${params.toString()}` : "";

  const response = await fetch(`${BASE_URL}/api/approvals${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách duyệt đơn");
  }
  return data;
};

// Phê duyệt đơn (Approve - A.5)
export const approveRequestApi = async (id, note = "") => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/requests/${id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Phê duyệt đơn thất bại");
  }
  return data;
};

// Từ chối đơn (Reject - A.5: Bắt buộc nhập lý do)
export const rejectRequestApi = async (id, reason) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/requests/${id}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Từ chối đơn thất bại");
  }
  return data;
};

