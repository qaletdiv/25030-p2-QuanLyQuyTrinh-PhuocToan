import { cookies } from "next/headers";

const BASE_URL = process.env.API_URL || "http://localhost:5000";

// Lấy danh sách thông báo và số lượng chưa đọc của user
export const getNotificationsApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể tải thông báo");
  }
  return data;
};

// Đánh dấu 1 thông báo là đã đọc
export const markNotificationReadApi = async (id) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể đánh dấu đã đọc");
  }
  return data;
};

// Đánh dấu tất cả thông báo là đã đọc
export const markAllNotificationsReadApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetch(`${BASE_URL}/api/notifications/mark-all-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Không thể đánh dấu tất cả đã đọc");
  }
  return data;
};

