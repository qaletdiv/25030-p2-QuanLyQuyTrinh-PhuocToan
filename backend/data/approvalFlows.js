const approvalFlowsData = [
  {
    requestTypeId: "rt-leave",
    steps: [
      { level: 1, title: "Trưởng phòng phê duyệt", approverRole: "approver" },
      { level: 2, title: "Bộ phận Nhân sự (HR)", approverRole: "approver" },
    ],
  },
  {
    requestTypeId: "rt-purchase",
    steps: [
      { level: 1, title: "Trưởng phòng phê duyệt", approverRole: "approver" },
      { level: 2, title: "Giám đốc tài chính (CFO)", approverRole: "approver" },
    ],
  },
];

module.exports = { approvalFlowsData };
