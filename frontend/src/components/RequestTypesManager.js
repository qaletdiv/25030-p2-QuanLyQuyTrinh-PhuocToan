"use client";

import { useState, useTransition } from "react";
import {
  createRequestTypeAction,
  updateRequestTypeAction,
  toggleRequestTypeAction,
  deleteRequestTypeAction,
} from "@/actions/admin.actions";

export default function RequestTypesManager({ initialTypes = [] }) {
  const [types, setTypes] = useState(initialTypes);
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Reset feedback after 4s
  const triggerFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
  };

  // Submit tạo mới
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createRequestTypeAction(null, formData);
      if (res.success) {
        triggerFeedback("success", res.message);
        setShowAddForm(false);
        // Tải lại state hiển thị
        window.location.reload();
      } else {
        triggerFeedback("error", res.error);
      }
    });
  };

  // Submit cập nhật
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateRequestTypeAction(null, formData);
      if (res.success) {
        triggerFeedback("success", res.message);
        setEditingType(null);
        window.location.reload();
      } else {
        triggerFeedback("error", res.error);
      }
    });
  };

  // Bật/tắt trạng thái ẩn/hiện
  const handleToggle = (id) => {
    startTransition(async () => {
      const res = await toggleRequestTypeAction(id);
      if (res.success) {
        setTypes((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
        );
        triggerFeedback("success", res.message);
      } else {
        triggerFeedback("error", res.error);
      }
    });
  };

  // Xóa loại đơn
  const handleDelete = (id, name) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa loại đơn "${name}" không?`)) return;

    startTransition(async () => {
      const res = await deleteRequestTypeAction(id);
      if (res.success) {
        setTypes((prev) => prev.filter((t) => t.id !== id));
        triggerFeedback("success", res.message);
      } else {
        triggerFeedback("error", res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action & Alerts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Danh mục loại đơn ({types.length})
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý các mẫu đơn trực tuyến, kích hoạt hoặc tạm dừng các quy trình
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingType(null);
          }}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span className="text-base leading-none font-bold">+</span>
          <span>{showAddForm ? "Đóng biểu mẫu" : "Thêm loại đơn mới"}</span>
        </button>
      </div>

      {/* Thông báo phản hồi */}
      {feedback.message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              feedback.type === "success" ? "bg-emerald-500" : "bg-rose-500"
            }`}
          />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Form thêm mới loại đơn */}
      {showAddForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white border-2 border-blue-500/30 rounded-xl p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
            Thêm loại đơn mới
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên loại đơn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="VD: Đơn công tác, Đơn thanh toán..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái áp dụng
              </label>
              <select
                name="isActive"
                defaultValue="true"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Hiển thị (Đang hoạt động)</option>
                <option value="false">Tạm ẩn</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả hướng dẫn
              </label>
              <textarea
                name="description"
                rows={2}
                placeholder="Mô tả mục đích sử dụng loại đơn này..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-60"
            >
              {isPending ? "Đang lưu..." : "Lưu loại đơn"}
            </button>
          </div>
        </form>
      )}

      {/* Form sửa loại đơn */}
      {editingType && (
        <form
          onSubmit={handleUpdateSubmit}
          className="bg-white border-2 border-amber-500/30 rounded-xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800">
              Chỉnh sửa loại đơn: {editingType.name}
            </h3>
            <span className="text-xs font-mono text-slate-400">{editingType.id}</span>
          </div>
          <input type="hidden" name="id" value={editingType.id} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên loại đơn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={editingType.name}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                name="isActive"
                defaultValue={editingType.isActive ? "true" : "false"}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="true">Hiển thị (Đang hoạt động)</option>
                <option value="false">Tạm ẩn</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingType.description}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingType(null)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 cursor-pointer disabled:opacity-60"
            >
              {isPending ? "Đang cập nhật..." : "Cập nhật thay đổi"}
            </button>
          </div>
        </form>
      )}

      {/* Bảng danh sách loại đơn */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Mã loại
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Tên loại đơn
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Mô tả hướng dẫn
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-600 text-xs">
                    {type.id}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {type.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {type.description || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        type.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          type.isActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      <span>{type.isActive ? "Đang hoạt động" : "Đã tạm ẩn"}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingType(type)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggle(type.id)}
                      disabled={isPending}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                        type.isActive
                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      }`}
                    >
                      {type.isActive ? "Ẩn" : "Hiện"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(type.id, type.name)}
                      disabled={isPending}
                      className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

