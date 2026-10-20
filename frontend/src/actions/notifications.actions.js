"use server";

import { revalidatePath } from "next/cache";
import {
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from "@/services/notifications.api";

// Đánh dấu 1 thông báo là đã đọc
export async function markNotificationReadAction(id) {
  if (!id) return { success: false, error: "Thiếu ID thông báo" };

  try {
    const result = await markNotificationReadApi(id);
    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    revalidatePath("/requests");
    revalidatePath("/notifications");
    return { success: true, message: result.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Đánh dấu tất cả thông báo là đã đọc
export async function markAllNotificationsReadAction() {
  try {
    const result = await markAllNotificationsReadApi();
    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    revalidatePath("/requests");
    revalidatePath("/notifications");
    return { success: true, message: result.message };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
