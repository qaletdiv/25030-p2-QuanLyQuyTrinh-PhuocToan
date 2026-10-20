const usersData = [
  {
    id: "u-admin-1",
    name: "Nguyễn Quản Trị (Admin)",
    email: "admin@company.com",
    password: "123456",
    department: "Ban Giám Đốc",
    role: "admin",
    isActive: true,
  },
  {
    id: "u-approver-1",
    name: "Trần Trưởng Phòng (Approver)",
    email: "approver@company.com",
    password: "123456",
    department: "Kỹ thuật & Công nghệ",
    role: "approver",
    isActive: true,
  },
  {
    id: "u-employee-1",
    name: "Lê Văn Nhân Viên (Employee)",
    email: "employee@company.com",
    password: "123456",
    department: "Kỹ thuật & Công nghệ",
    role: "employee",
    isActive: true,
  },
  {
    id: "u-employee-2",
    name: "Phạm Thị Đồng Nghiệp",
    email: "phamthidongnghiep@company.com",
    password: "123456",
    department: "Kỹ thuật & Công nghệ",
    role: "employee",
    isActive: false, // Tài khoản chưa kích hoạt / không hoạt động
  },
  {
    id: "u-approver-hr",
    name: "Vũ Thị Nhân Sự",
    email: "hr@company.com",
    password: "123456",
    department: "Nhân sự & Hành chính",
    role: "approver",
    isActive: true,
  },
  {
    id: "u-approver-cfo",
    name: "Hoàng Giám Đốc Tài Chính (CFO)",
    email: "cfo@company.com",
    password: "123456",
    department: "Kế toán - Tài chính",
    role: "approver",
    isActive: true,
  },
];

module.exports = { usersData };

