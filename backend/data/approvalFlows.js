const approvalFlowsData = [
  {
    requestTypeId: "rt-leave",
    steps: [
      { level: 1, title: "Trưởng phòng phê duyệt", approverRole: "approver" },
      { level: 2, title: "Bộ phận Nhân sự (HR)", approverRole: "approver" },
    ],
    conditionalRules: [],
  },
  {
    requestTypeId: "rt-purchase",
    steps: [
      { level: 1, title: "Trưởng phòng phê duyệt", approverRole: "approver" },
    ],
    conditionalRules: [
      {
        id: "cr-1",
        name: "Đơn giá trị cao (> 10.000.000 VND)",
        field: "totalAmount",
        operator: ">",
        value: 10000000,
        insertStep: {
          level: 2,
          title: "Giám đốc tài chính (CFO)",
          approverRole: "approver",
        },
        description: "Khi tổng tiền > 10.000.000 VND, bắt buộc qua thêm cấp Giám đốc tài chính (CFO) trước khi hoàn tất",
        isActive: true,
      },
    ],
  },
];

module.exports = { approvalFlowsData };
