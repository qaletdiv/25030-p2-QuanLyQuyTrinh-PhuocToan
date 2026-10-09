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
