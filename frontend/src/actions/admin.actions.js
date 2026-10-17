"use server";

import { revalidatePath } from "next/cache";
import {
  createRequestTypeApi,
  updateRequestTypeApi,
  toggleRequestTypeApi,
  deleteRequestTypeApi,
  updateApprovalFlowApi,
} from "@/services/admin.api";

// Tạo loại đơn mới
export async function createRequestTypeAction(prevState, formData) {
  const name = formData.get("name");
  const description = formData.get("description") || "";
  const isActive = formData.get("isActive") === "true";

  if (!name || !name.trim()) {
    return { success: false, error: "Vui lòng nhập tên loại đơn" };
  }

  try {
    const result = await createRequestTypeApi({
      name: name.trim(),
      description: description.trim(),
      isActive,
    });

    revalidatePath("/admin/request-types");
    revalidatePath("/admin/approval-flows");
    revalidatePath("/requests/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: result.message || "Tạo loại đơn thành công",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Lỗi khi tạo loại đơn",
    };
  }
}

// Cập nhật loại đơn
export async function updateRequestTypeAction(prevState, formData) {
  const id = formData.get("id");
  const name = formData.get("name");
  const description = formData.get("description") || "";
  const isActive = formData.get("isActive") === "true";

  if (!id || !name || !name.trim()) {
    return { success: false, error: "Dữ liệu cập nhật không hợp lệ" };
  }

  try {
    const result = await updateRequestTypeApi(id, {
      name: name.trim(),
      description: description.trim(),
      isActive,
    });

    revalidatePath("/admin/request-types");
    revalidatePath("/admin/approval-flows");
    revalidatePath("/requests/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: result.message || "Cập nhật loại đơn thành công",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Lỗi khi cập nhật loại đơn",
    };
  }
}

// Bật/Tắt ẩn hiện loại đơn
export async function toggleRequestTypeAction(id) {
  if (!id) return { success: false, error: "Thiếu ID loại đơn" };

  try {
    const result = await toggleRequestTypeApi(id);

    revalidatePath("/admin/request-types");
    revalidatePath("/admin/approval-flows");
    revalidatePath("/requests/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: result.message || "Thay đổi trạng thái thành công",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Lỗi khi thay đổi trạng thái",
    };
  }
}

// Xóa loại đơn
export async function deleteRequestTypeAction(id) {
  if (!id) return { success: false, error: "Thiếu ID loại đơn" };

  try {
    const result = await deleteRequestTypeApi(id);

    revalidatePath("/admin/request-types");
    revalidatePath("/admin/approval-flows");
    revalidatePath("/requests/new");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: result.message || "Đã xóa loại đơn",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Lỗi khi xóa loại đơn",
    };
  }
}

// Cập nhật cấu hình luồng duyệt và điều kiện rẽ nhánh
export async function updateApprovalFlowAction(requestTypeId, flowData) {
  if (!requestTypeId || !flowData) {
    return { success: false, error: "Dữ liệu cấu hình không hợp lệ" };
  }

  try {
    const result = await updateApprovalFlowApi(requestTypeId, flowData);

    revalidatePath("/admin/approval-flows");
    revalidatePath("/approvals");
    revalidatePath("/requests");

    return {
      success: true,
      message: result.message || "Cập nhật cấu hình luồng duyệt thành công",
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Lỗi khi cập nhật cấu hình luồng duyệt",
    };
  }
}

