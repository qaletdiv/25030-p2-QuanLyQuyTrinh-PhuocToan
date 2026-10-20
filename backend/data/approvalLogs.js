const approvalLogsData = [
  {
    id: "log-1",
    requestId: "REQ-002",
    level: 1,
    approverId: "u-approver-1",
    approverName: "Trần Trưởng Phòng",
    action: "approve",
    note: "Đã trao đổi nội bộ, công việc bàn giao tốt. Đồng ý duyệt cấp 1.",
    timestamp: "2026-10-02T10:15:00.000Z",
  },
  {
    id: "log-2",
    requestId: "REQ-003",
    level: 1,
    approverId: "u-approver-1",
    approverName: "Trần Trưởng Phòng",
    action: "approve",
    note: "Đồng ý cho nhân viên nghỉ phép năm.",
    timestamp: "2026-10-01T15:00:00.000Z",
  },
  {
    id: "log-3",
    requestId: "REQ-003",
    level: 2,
    approverId: "u-approver-hr",
    approverName: "Vũ Thị Nhân Sự",
    action: "approve",
    note: "Đã kiểm tra quỹ phép năm còn 8 ngày. Phê duyệt hoàn tất.",
    timestamp: "2026-10-02T14:30:00.000Z",
  },
  {
    id: "log-4",
    requestId: "REQ-004",
    level: 1,
    approverId: "u-approver-1",
    approverName: "Trần Trưởng Phòng",
    action: "reject",
    note: "Tuần này bộ phận đang triển khai dự án gấp cho khách hàng, không thể bố trí nghỉ lúc này.",
    timestamp: "2026-09-25T11:20:00.000Z",
  },
];

module.exports = { approvalLogsData };
