const requestTypesData = [
  {
    id: "rt-leave",
    name: "Đơn nghỉ phép",
    description:
      "Dành cho nhân viên xin nghỉ phép năm, nghỉ ốm, hoặc nghỉ không lương.",
    isActive: true,
    fields: [
      {
        name: "leaveType",
        label: "Loại nghỉ phép",
        type: "select",
        required: true,
        options: ["Nghỉ phép năm", "Nghỉ ốm", "Nghỉ không lương"],
      },
      {
        name: "startDate",
        label: "Từ ngày",
        type: "date",
        required: true,
      },
      {
        name: "endDate",
        label: "Đến ngày",
        type: "date",
        required: true,
      },
      {
        name: "totalDays",
        label: "Tổng số ngày nghỉ",
        type: "number",
        required: true,
        readOnly: true,
      },
      {
        name: "reason",
        label: "Lý do nghỉ",
        type: "textarea",
        required: true,
      },
      {
        name: "handoverUserId",
        label: "Người bàn giao công việc",
        type: "colleague-select",
        required: true,
      },
    ],
  },
  {
    id: "rt-purchase",
    name: "Đơn mua hàng",
    description: "Dành cho đề xuất mua sắm trang thiết bị, vật tư văn phòng.",
    isActive: true,
    fields: [
      {
        name: "reason",
        label: "Lý do mua sắm",
        type: "textarea",
        required: true,
      },
      {
        name: "items",
        label: "Danh sách sản phẩm",
        type: "table",
        required: true,
      },
      {
        name: "totalAmount",
        label: "Tổng tiền đơn hàng",
        type: "number",
        required: true,
      },
    ],
  },
];

module.exports = { requestTypesData };
