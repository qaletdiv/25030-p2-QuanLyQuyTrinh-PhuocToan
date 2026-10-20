"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashCan,
  faPaperclip,
  faPaperPlane,
  faBolt,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { createRequestAction } from "@/actions/requests.actions";
import Spinner from "@/components/Spinner";

export default function DynamicRequestForm({
  requestTypes = [],
  colleagues = [],
}) {
  const [selectedTypeId, setSelectedTypeId] = useState(
    requestTypes[0]?.id || "rt-leave",
  );

  // State cho Đơn nghỉ phép (rt-leave)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(1);
  const [dateError, setDateError] = useState("");

  // State cho Đơn mua hàng (rt-purchase)
  const [purchaseReason, setPurchaseReason] = useState("");
  const [items, setItems] = useState([
    { name: "", quantity: 1, price: 0, amount: 0 },
  ]);

  const [fileError, setFileError] = useState("");

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

  // Logic Đơn nghỉ phép: Tự động tính số ngày nghỉ khi chọn ngày & validate
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
    if (start && start < minDateStr) {
      setDateError("Ngày bắt đầu nghỉ không được chọn trong quá khứ!");
      setTotalDays(0);
      return;
    }

    if (start && end && end < start) {
      setDateError("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
      setTotalDays(0);
      return;
    }

    setDateError("");

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

  // Logic Đơn mua hàng: Thêm / sửa / xóa sản phẩm & tính tiền tự động
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === "quantity") {
      const q = Math.max(1, parseInt(value) || 0);
      updated[index].quantity = q;
      updated[index].amount = q * (updated[index].price || 0);
    } else if (field === "price") {
      const p = Math.max(0, parseInt(value) || 0);
      updated[index].price = p;
      updated[index].amount = (updated[index].quantity || 1) * p;
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { name: "", quantity: 1, price: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  const totalPurchaseAmount = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  const [selectedFileName, setSelectedFileName] = useState("");

  // Kiểm tra file đính kèm <= 5MB và đúng định dạng JPG, PNG, PDF (A.3)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedExts = [".jpg", ".jpeg", ".png", ".pdf"];
      const ext = "." + file.name.split(".").pop().toLowerCase();

      if (!allowedExts.includes(ext)) {
        setFileError("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, PNG hoặc PDF.");
        setSelectedFileName("");
        e.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        setFileError("Kích thước tệp vượt quá 5MB. Vui lòng chọn tệp nhỏ hơn.");
        setSelectedFileName("");
        e.target.value = "";
        return;
      }

      setFileError("");
      const sizeStr =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;
      setSelectedFileName(`${file.name} (${sizeStr})`);
    } else {
      setSelectedFileName("");
      setFileError("");
    }
  };

  const isPurchase = selectedTypeId === "rt-purchase";

  const isSubmitDisabled =
    isPending ||
    Boolean(fileError) ||
    (!isPurchase &&
      (Boolean(dateError) || totalDays <= 0 || !startDate || !endDate)) ||
    (isPurchase &&
      (!purchaseReason.trim() ||
        totalPurchaseAmount <= 0 ||
        items.some((it) => !it.name.trim() || it.price <= 0)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Tạo yêu cầu phê duyệt mới
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn loại đơn và điền thông tin chi tiết theo quy trình chuẩn
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
            {isPurchase ? "Mẫu Đơn Mua Hàng & Vật Tư" : "Mẫu Đơn Nghỉ Phép Chuẩn"}
          </span>
        </div>

        {/* Thông báo lỗi */}
        {(state?.error || fileError || (!isPurchase && dateError)) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span>{dateError || fileError || state?.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="requestTypeId" value={selectedTypeId} />

          {/* =========================================================
              TRƯỜNG HỢP 1: ĐƠN NGHỈ PHÉP (rt-leave)
             ========================================================= */}
          {!isPurchase ? (
            <div className="space-y-4">
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

              {/* 5. Người bàn giao công việc */}
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
            </div>
          ) : (
            /* =========================================================
               TRƯỜNG HỢP 2: ĐƠN MUA HÀNG (rt-purchase)
               ========================================================= */
            <div className="space-y-4">
              {/* 1. Lý do mua sắm */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Lý do / Mục đích mua sắm <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="reason"
                  required
                  rows={2}
                  disabled={isPending}
                  value={purchaseReason}
                  onChange={(e) => setPurchaseReason(e.target.value)}
                  placeholder="Mô tả mục đích mua sắm (VD: Phục vụ dự án phát triển phần mềm quý 4, bổ sung trang thiết bị văn phòng...)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* 2. Danh sách sản phẩm mua sắm (Bảng động) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700">
                    Danh sách sản phẩm / vật tư cần mua <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    <span>Thêm dòng sản phẩm</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3">Tên sản phẩm / Thiết bị</th>
                        <th className="py-2.5 px-3 w-24">Số lượng</th>
                        <th className="py-2.5 px-3 w-36">Đơn giá dự kiến (VNĐ)</th>
                        <th className="py-2.5 px-3 w-36 text-right">Thành tiền (VNĐ)</th>
                        <th className="py-2.5 px-3 w-16 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center text-slate-400 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              disabled={isPending}
                              value={item.name}
                              onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                              placeholder="VD: Màn hình Dell Ultrasharp 27 inch..."
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              required
                              disabled={isPending}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 text-center focus:outline-none focus:border-blue-600"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="50000"
                              required
                              disabled={isPending}
                              value={item.price || ""}
                              onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                              placeholder="0"
                              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-900 text-right focus:outline-none focus:border-blue-600"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800">
                            {new Intl.NumberFormat("vi-VN").format(item.amount || 0)} đ
                          </td>
                          <td className="py-2 px-3 text-center">
                            {items.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                disabled={isPending}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded transition-colors text-xs font-bold cursor-pointer"
                                title="Xóa dòng này"
                              >
                                <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Card Tổng tiền & Gợi ý Luồng rẽ nhánh thông minh */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                      Tổng tiền đơn hàng (Hệ thống tự tính)
                    </span>
                    <span className="text-xs text-slate-400">
                      Tự động cộng dồn Thành tiền của tất cả các sản phẩm
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-blue-700">
                      {new Intl.NumberFormat("vi-VN").format(totalPurchaseAmount)} VNĐ
                    </span>
                  </div>
                </div>

                {/* Banner nghiệp vụ rẽ nhánh */}
                {totalPurchaseAmount > 10000000 ? (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
                    <FontAwesomeIcon icon={faBolt} className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <strong className="font-bold">Đơn mua sắm giá trị cao (&gt; 10.000.000 VNĐ):</strong>
                      <p className="mt-0.5 text-amber-700 leading-relaxed">
                        Hệ thống tự động kích hoạt điều kiện rẽ nhánh: Đơn sẽ chuyển tiếp lên <strong>Giám đốc tài chính (CFO)</strong> thẩm định và ký duyệt sau khi Trưởng phòng duyệt xong.
                      </p>
                    </div>
                  </div>
                ) : totalPurchaseAmount > 0 ? (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
                    <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Đơn mua sắm tiêu chuẩn (≤ 10.000.000 VNĐ):</strong> Áp dụng quy trình phê duyệt thông thường qua 1 cấp Trưởng phòng.
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Hidden inputs cho Đơn mua hàng để Server Action gửi API */}
              <input type="hidden" name="items" value={JSON.stringify(items)} />
              <input type="hidden" name="totalAmount" value={totalPurchaseAmount} />
            </div>
          )}

          {/* 6. Đính kèm tệp chung (≤ 5MB) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tệp đính kèm ({isPurchase ? "Báo giá, hóa đơn tham khảo..." : "Giấy khám, minh chứng..."} — JPG, PNG, PDF ≤ 5MB)
            </label>
            <input
              type="file"
              name="attachments"
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={isPending}
              onChange={handleFileChange}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFileName && !fileError && (
              <p className="text-[11px] text-emerald-600 mt-1.5 font-medium flex items-center gap-1.5">
                <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 text-emerald-600" />
                <span>Đã chọn: {selectedFileName}</span>
              </p>
            )}
            {fileError && (
              <p className="text-[11px] text-red-600 mt-1 font-medium">
                {fileError}
              </p>
            )}
          </div>

          {/* Nút gửi đơn */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors duration-150 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <Spinner size="sm" text="Đang gửi đơn..." />
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
                  <span>Gửi đơn phê duyệt</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
