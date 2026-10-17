"use server";

import { revalidatePath } from "next/cache";
import { approveRequestApi, rejectRequestApi } from "@/services/approvals.api";

// Server action phê duyệt đơn
export async function approveRequestAction(prevState, formData) {
  const requestId = formData.get("requestId");
  const note = formData.get("note") || "";

  if (!requestId) {
    return { error: "Thiếu mã đơn yêu cầu", success: false };
  }

  try {
    const result = await approveRequestApi(requestId, note);

    revalidatePath("/approvals");
    revalidatePath(`/approvals/${requestId}`);
    revalidatePath("/dashboard");
    revalidatePath("/requests");
    revalidatePath(`/requests/${requestId}`);

    return {
      success: true,
      message: result.message || "Phê duyệt đơn thành công",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Có lỗi xảy ra khi phê duyệt đơn",
    };
  }
}

// Server action từ chối đơn (Bắt buộc lý do)
export async function rejectRequestAction(prevState, formData) {
  const requestId = formData.get("requestId");
  const reason = formData.get("reason");

  if (!requestId) {
    return { error: "Thiếu mã đơn yêu cầu", success: false };
  }

  if (!reason || !reason.trim()) {
    return {
      error: "Bắt buộc phải nhập lý do khi từ chối đơn theo quy định",
      success: false,
    };
  }

  try {
    const result = await rejectRequestApi(requestId, reason.trim());

    revalidatePath("/approvals");
    revalidatePath(`/approvals/${requestId}`);
    revalidatePath("/dashboard");
    revalidatePath("/requests");
    revalidatePath(`/requests/${requestId}`);

    return {
      success: true,
      message: result.message || "Đã từ chối đơn thành công",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Có lỗi xảy ra khi từ chối đơn",
    };
  }
}
