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

  // Validate ngày nếu có
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
