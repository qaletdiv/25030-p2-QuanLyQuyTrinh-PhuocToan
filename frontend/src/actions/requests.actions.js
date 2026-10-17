"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRequestApi } from "@/services/requests.api";

export async function createRequestAction(prevState, formData) {
  const requestTypeId = formData.get("requestTypeId");

  if (!requestTypeId) {
    return { error: "Vui lòng chọn loại đơn hợp lệ" };
  }

  // Thu thập các trường formData động
  const formPayload = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "requestTypeId" && key !== "attachments") {
      formPayload[key] = value;
    }
  }

  // Xử lý dữ liệu đặc thù cho Đơn mua hàng (rt-purchase)
  if (requestTypeId === "rt-purchase") {
    if (typeof formPayload.items === "string") {
      try {
        formPayload.items = JSON.parse(formPayload.items);
      } catch (e) {
        formPayload.items = [];
      }
    }
    if (formPayload.totalAmount) {
      formPayload.totalAmount = Number(formPayload.totalAmount);
    }

    if (!formPayload.reason || !formPayload.reason.trim()) {
      return { error: "Vui lòng nhập lý do / mục đích mua sắm" };
    }

    if (!Array.isArray(formPayload.items) || formPayload.items.length === 0) {
      return { error: "Vui lòng thêm ít nhất một sản phẩm cần mua" };
    }

    for (const item of formPayload.items) {
      if (!item.name || !item.name.trim()) {
        return { error: "Vui lòng nhập đầy đủ tên sản phẩm" };
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        return { error: "Số lượng sản phẩm phải lớn hơn 0" };
      }
      if (item.price === undefined || Number(item.price) <= 0) {
        return { error: "Đơn giá sản phẩm phải lớn hơn 0" };
      }
    }

    if (!formPayload.totalAmount || formPayload.totalAmount <= 0) {
      return { error: "Tổng tiền đơn hàng phải lớn hơn 0" };
    }
  }

  // Validate ngày nếu có (Đơn nghỉ phép)
  if (formPayload.startDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (formPayload.startDate < todayStr) {
      return { error: "Ngày bắt đầu nghỉ không được ở trong quá khứ" };
    }
    if (formPayload.endDate && formPayload.endDate < formPayload.startDate) {
      return { error: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu" };
    }
  }

  let success = false;

  try {
    await createRequestApi({
      requestTypeId,
      formData: formPayload,
      attachments: [],
    });

    revalidatePath("/dashboard");
    revalidatePath("/requests");
    success = true;
  } catch (err) {
    return { error: err.message };
  }

  if (success) {
    redirect("/dashboard");
  }
}
