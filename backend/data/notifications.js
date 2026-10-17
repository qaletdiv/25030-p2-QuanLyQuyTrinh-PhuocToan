const notificationsData = [
  {
    id: "notif-1",
    userId: "u-employee-1",
    message: "Đơn REQ-003 của bạn đã được Vũ Thị Nhân Sự phê duyệt hoàn tất.",
    isRead: false,
    createdAt: "2026-10-06T14:35:00.000Z",
    relatedRequestId: "REQ-003",
  },
  {
    id: "notif-2",
    userId: "u-employee-1",
    message: "Đơn REQ-004 của bạn đã bị từ chối bởi Trần Trưởng Phòng. Lý do: Tuần này bộ phận đang triển khai dự án gấp cho khách hàng, không thể bố trí nghỉ lúc này.",
    isRead: false,
    createdAt: "2026-10-07T11:25:00.000Z",
    relatedRequestId: "REQ-004",
  },
  {
    id: "notif-3",
    userId: "u-approver-1",
    message: "Có đơn Đơn nghỉ phép mới từ Lê Văn Nhân Viên đang chờ bạn duyệt.",
    isRead: false,
    createdAt: "2026-10-05T08:35:00.000Z",
    relatedRequestId: "REQ-001",
  },
];

module.exports = { notificationsData };
