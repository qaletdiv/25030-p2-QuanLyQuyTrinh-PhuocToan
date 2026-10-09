import { cookies } from "next/headers";

const BASE_URL = process.env.API_URL || "http://localhost:5000";

export const getRequestTypesApi = async () => {
  const res = await fetch(`${BASE_URL}/api/request-types`, {
    next: { tags: ["request-types"] },
  });
  if (!res.ok) {
    throw new Error("Không thể lấy danh sách loại đơn");
  }
  return await res.json();
};

export const getColleaguesApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return [];

  const res = await fetch(`${BASE_URL}/api/users/colleagues`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return await res.json();
};
