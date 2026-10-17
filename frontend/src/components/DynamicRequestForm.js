"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { createRequestAction } from "@/actions/requests.actions";
import Spinner from "@/components/Spinner";

export default function DynamicRequestForm({
  requestTypes = [],
  colleagues = [],
}) {
  const [selectedTypeId, setSelectedTypeId] = useState(
    requestTypes[0]?.id || "rt-leave",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(1);
  const [fileError, setFileError] = useState("");
  const [dateError, setDateError] = useState("");

  // Chuẩn hóa ngày hôm nay dạng YYYY-MM-DD theo giờ địa phương
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const minDateStr = `${yyyy}-${mm}-${dd}`;

  const [state, formAction, isPending] = useActionState(
    createRequestAction,
    null,
  );

  const currentType =
    requestTypes.find((t) => t.id === selectedTypeId) || requestTypes[0];

  // Tự động tính số ngày nghỉ khi chọn ngày & kiểm tra tính hợp lệ
  const handleStartDateChange = (e) => {
    const start = e.target.value;
    setStartDate(start);
    validateAndCalculateDays(start, endDate);
  };

  const handleEndDateChange = (e) => {
    const end = e.target.value;
    setEndDate(end);
    validateAndCalculateDays(startDate, end);
  };

  const validateAndCalculateDays = (start, end) => {
    // 1. Kiểm tra ngày bắt đầu không ở trong quá khứ
    if (start && start < minDateStr) {
      setDateError("Ngày bắt đầu nghỉ không được chọn trong quá khứ!");
      setTotalDays(0);
      return;
    }

    // 2. Kiểm tra ngày kết thúc >= ngày bắt đầu
    if (start && end && end < start) {
      setDateError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
      setTotalDays(0);
      return;
    }

    setDateError("");

    // 3. Tính tổng số ngày nghỉ hợp lệ
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      if (d2 >= d1) {
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(diffDays);
      } else {
        setTotalDays(0);
      }
    }
  };

  // Kiểm tra file đính kèm <= 5MB
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setFileError("Kích thước tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.");
        e.target.value = "";
      } else {
        setFileError("");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Tạo yêu cầu phê duyệt mới
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Điền đầy đủ thông tin để gửi đơn đến cấp có thẩm quyền phê duyệt
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          Hủy bỏ
        </Link>
      </div>

      {/* BƯỚC 1: CHỌN LOẠI ĐƠN */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Bước 1: Chọn loại đơn đề xuất
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {requestTypes.map((type) => {
            const isSelected = selectedTypeId === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedTypeId(type.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-slate-800"}`}
                  >
                    {type.name}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shadow-xs" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* BƯỚC 2: FORM ĐỘNG THEO LOẠI ĐƠN */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Bước 2: Thông tin chi tiết — {currentType?.name}
          </label>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Mẫu chuẩn
          </span>
        </div>

        {/* Thông báo lỗi */}
        {(state?.error || fileError || dateError) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{dateError || fileError || state?.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="requestTypeId" value={selectedTypeId} />

          {/* 1. Loại nghỉ phép */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Hình thức nghỉ phép <span className="text-rose-500">*</span>
            </label>
            <select
              name="leaveType"
              required
              disabled={isPending}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="Nghỉ phép năm">Nghỉ phép năm (hưởng lương)</option>
              <option value="Nghỉ ốm">Nghỉ ốm / Khám chữa bệnh</option>
              <option value="Nghỉ không lương">Nghỉ không lương</option>
            </select>
          </div>

          {/* 2. Từ ngày & Đến ngày */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Từ ngày <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                min={minDateStr}
                required
                disabled={isPending}
                value={startDate}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Đến ngày <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                min={startDate || minDateStr}
                required
                disabled={isPending}
                value={endDate}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* 3. Tổng số ngày nghỉ (Tự động tính) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Tổng số ngày nghỉ (Hệ thống tự tính)
              </label>
              <span className="text-[10px] text-slate-400">
                Tự động cộng ngày
              </span>
            </div>
            <input
              type="number"
              name="totalDays"
              readOnly
              value={totalDays}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 font-bold cursor-not-allowed"
            />
          </div>

          {/* 4. Lý do nghỉ */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Lý do xin nghỉ <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="reason"
              required
              rows={3}
              disabled={isPending}
              placeholder="Ghi rõ lý do xin nghỉ phép để người duyệt xem xét..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* 5. Người bàn giao công việc (Dropdown đồng nghiệp cùng phòng ban) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Người bàn giao công việc (Cùng phòng ban){" "}
              <span className="text-rose-500">*</span>
            </label>
            <select
              name="handoverUserId"
              required
              disabled={isPending}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {colleagues.length > 0 ? (
                colleagues.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))
              ) : (
                <option value="none">
                  Chưa có nhân viên khác trong phòng ban
                </option>
              )}
            </select>
          </div>

          {/* 6. Đính kèm tệp (≤ 5MB) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tệp đính kèm (Tùy chọn — JPG, PNG, PDF ≤ 5MB)
            </label>
            <input
              type="file"
              name="attachments"
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={isPending}
              onChange={handleFileChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {/* Nút gửi đơn */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isPending || Boolean(fileError) || Boolean(dateError) || totalDays <= 0}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors duration-150 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending ? (
                <Spinner size="sm" text="Đang gửi đơn..." />
              ) : (
                "Gửi đơn phê duyệt"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
