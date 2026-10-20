"use client";

import { useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrashCan,
  faCheck,
  faCodeBranch,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { updateApprovalFlowAction } from "@/actions/admin.actions";

export const APPROVER_ROLES = [
  { value: "manager", label: "Trưởng phòng của người tạo (cùng phòng ban)" },
  { value: "hr", label: "Bộ phận Nhân sự (HR)" },
  { value: "cfo", label: "Giám đốc / Ban Giám Đốc (CFO)" },
  { value: "approver", label: "Người duyệt bất kỳ (Approver)" },
  { value: "admin", label: "Quản trị viên (Admin)" },
];

export default function ApprovalFlowConfigurator({ initialFlows = [], types = [] }) {
  const [flows, setFlows] = useState(initialFlows);
  const [selectedTypeId, setSelectedTypeId] = useState(
    types[0]?.id || flows[0]?.requestTypeId || ""
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const currentFlow = flows.find((f) => f.requestTypeId === selectedTypeId) || {
    requestTypeId: selectedTypeId,
    steps: [{ level: 1, title: "Trưởng phòng phê duyệt", approverRole: "manager" }],
    conditionalRules: [],
  };

  const [steps, setSteps] = useState(currentFlow.steps || []);
  const [rules, setRules] = useState(currentFlow.conditionalRules || []);

  // Khi đổi loại đơn
  const handleSelectType = (typeId) => {
    setSelectedTypeId(typeId);
    const flow = flows.find((f) => f.requestTypeId === typeId) || {
      requestTypeId: typeId,
      steps: [{ level: 1, title: "Trưởng phòng phê duyệt", approverRole: "manager" }],
      conditionalRules: [],
    };
    setSteps(flow.steps || []);
    setRules(flow.conditionalRules || []);
    setFeedback({ type: "", message: "" });
  };

  // Thêm bước duyệt mới
  const handleAddStep = () => {
    const nextLevel = steps.length + 1;
    setSteps([
      ...steps,
      {
        level: nextLevel,
        title: `Cấp ${nextLevel} phê duyệt`,
        approverRole: "approver",
      },
    ]);
  };

  // Sửa tiêu đề bước
  const handleUpdateStepTitle = (index, title) => {
    const updated = [...steps];
    updated[index].title = title;
    setSteps(updated);
  };

  // Xóa bước duyệt
  const handleRemoveStep = (index) => {
    if (steps.length <= 1) {
      alert("Luồng duyệt phải có tối thiểu 1 cấp!");
      return;
    }
    const updated = steps.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      level: idx + 1,
    }));
    setSteps(updated);
  };

  // Thêm điều kiện rẽ nhánh mới
  const handleAddRule = () => {
    const newRule = {
      id: `cr-${Date.now()}`,
      name: "Quy tắc rẽ nhánh mới",
      field: "totalAmount",
      operator: ">",
      value: 10000000,
      insertStep: {
        level: steps.length + 1,
        title: "Giám đốc tài chính (CFO) phê duyệt",
        approverRole: "cfo",
      },
      description: "Nếu tổng tiền vượt hạn mức quy định thì chèn thêm cấp duyệt",
      isActive: true,
    };
    setRules([...rules, newRule]);
  };

  // Sửa quy tắc rẽ nhánh
  const handleUpdateRule = (index, key, val) => {
    const updated = [...rules];
    if (key.startsWith("insertStep.")) {
      const subKey = key.split(".")[1];
      updated[index].insertStep = {
        ...updated[index].insertStep,
        [subKey]: val,
      };
    } else {
      updated[index][key] = val;
    }
    setRules(updated);
  };

  // Xóa quy tắc rẽ nhánh
  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Lưu toàn bộ cấu hình
  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        steps,
        conditionalRules: rules,
      };

      const res = await updateApprovalFlowAction(selectedTypeId, payload);
      if (res.success) {
        setFeedback({ type: "success", message: res.message });
        // Cập nhật flows trong state
        setFlows((prev) =>
          prev.map((f) => (f.requestTypeId === selectedTypeId ? { ...f, ...payload } : f))
        );
      } else {
        setFeedback({ type: "error", message: res.error });
      }

      setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
    });
  };

  const selectedTypeInfo = types.find((t) => t.id === selectedTypeId);

  return (
    <div className="space-y-6">
      {/* Selector Loại đơn */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Chọn loại đơn cần cấu hình quy trình:
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectType(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTypeId === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Thông báo feedback */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
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

      {/* PHẦN 1: CẤU HÌNH CÁC CẤP DUYỆT CỐ ĐỊNH */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              1. Cấu hình các cấp duyệt ({steps.length} cấp)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Thiết lập thứ tự duyệt từ cấp 1 đến khi hoàn tất cho:{" "}
              <strong className="text-blue-700 font-bold">{selectedTypeInfo?.name || selectedTypeId}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200 shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
            <span>Thêm cấp duyệt</span>
          </button>
        </div>

        {/* Danh sách các cấp */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.level}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <div className="flex items-center gap-3 shrink-0">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {step.level}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Cấp {step.level}
                </span>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleUpdateStepTitle(idx, e.target.value)}
                    placeholder="Tên chức danh hoặc bộ phận duyệt..."
                    className="w-full px-3.5 py-2 text-sm font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <select
                    value={step.approverRole || "manager"}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[idx].approverRole = e.target.value;
                      setSteps(updated);
                    }}
                    className="w-full px-3.5 py-2 text-sm font-semibold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs cursor-pointer"
                  >
                    {APPROVER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 border border-rose-200"
                  title="Xóa cấp duyệt này"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PHẦN 2: CẤU HÌNH ĐIỀU KIỆN RẼ NHÁNH (CONDITIONAL ROUTING) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              2. Điều kiện rẽ nhánh (Conditional Routing)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tự động chèn thêm cấp duyệt khi dữ liệu đơn thỏa mãn điều kiện logic (Mục 5 Nghiệp vụ)
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddRule}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200 shrink-0"
          >
            <FontAwesomeIcon icon={faCodeBranch} className="w-3 h-3" />
            <span>Thêm quy tắc rẽ nhánh</span>
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Chưa có điều kiện rẽ nhánh nào cho loại đơn này. Đơn sẽ duyệt tuần tự qua các cấp cố định.
          </div>
        ) : (
          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div
                key={rule.id || idx}
                className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <input
                      type="text"
                      value={rule.name}
                      onChange={(e) => handleUpdateRule(idx, "name", e.target.value)}
                      placeholder="Tên quy tắc..."
                      className="font-bold text-xs text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none bg-transparent"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="w-3 h-3" />
                    <span>Xóa quy tắc</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Trường so sánh</label>
                    <select
                      value={rule.field}
                      onChange={(e) => handleUpdateRule(idx, "field", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold cursor-pointer"
                    >
                      <option value="totalAmount">Tổng tiền (totalAmount)</option>
                      <option value="totalDays">Tổng số ngày (totalDays)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Toán tử</label>
                    <select
                      value={rule.operator}
                      onChange={(e) => handleUpdateRule(idx, "operator", e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold cursor-pointer"
                    >
                      <option value=">">Lớn hơn (&gt;)</option>
                      <option value=">=">Lớn hơn hoặc bằng (&gt;=)</option>
                      <option value="=">Bằng (=)</option>
                      <option value="<">Nhỏ hơn (&lt;)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Giá trị ngưỡng</label>
                    <input
                      type="number"
                      value={rule.value}
                      onChange={(e) => handleUpdateRule(idx, "value", Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Tên cấp chèn</label>
                    <input
                      type="text"
                      value={rule.insertStep?.title || ""}
                      onChange={(e) =>
                        handleUpdateRule(idx, "insertStep.title", e.target.value)
                      }
                      placeholder="VD: Giám đốc tài chính (CFO)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Đối tượng duyệt</label>
                    <select
                      value={rule.insertStep?.approverRole || "cfo"}
                      onChange={(e) =>
                        handleUpdateRule(idx, "insertStep.approverRole", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold cursor-pointer"
                    >
                      {APPROVER_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  💡 Diễn giải: Nếu <strong className="text-slate-900">{rule.field}</strong> {rule.operator} <strong className="text-slate-900">{Number(rule.value).toLocaleString("vi-VN")}</strong>, hệ thống sẽ tự động chèn thêm cấp duyệt: <strong className="text-blue-700 font-bold">{rule.insertStep?.title || "Cấp rẽ nhánh"}</strong> (Người duyệt: <strong className="text-purple-700 font-bold">{APPROVER_ROLES.find(r => r.value === (rule.insertStep?.approverRole || "cfo"))?.label || rule.insertStep?.approverRole}</strong>).
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nút Lưu cấu hình */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Đang lưu cấu hình...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              <span>Lưu cấu hình quy trình duyệt</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

