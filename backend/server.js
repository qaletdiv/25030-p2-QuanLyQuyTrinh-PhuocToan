const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'quy_trinh_duyet_secret_key_2026';

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

/* =========================================================================
   IN-MEMORY DATABASE (Mục 1.2 Quản lý dữ liệu - Tách theo từng thực thể)
========================================================================= */
const { usersData: users } = require('./data/users');
const { requestTypesData: requestTypes } = require('./data/requestTypes');
const { approvalFlowsData: approvalFlows } = require('./data/approvalFlows');
const { approvalLogsData: approvalLogs } = require('./data/approvalLogs');
const { requestsData: requests } = require('./data/requests');
const { notificationsData: notifications } = require('./data/notifications');

/* =========================================================================
   MIDDLEWARE AUTH HELPER
========================================================================= */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'User không tồn tại' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};

/* =========================================================================
   AUTH ROUTES (A.1)
========================================================================= */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, department, role } = req.body;
  if (!name || !email || !password || !department) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống' });
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name,
    email,
    password,
    department,
    role: role || 'employee',
  };

  users.push(newUser);
  return res.status(201).json({ success: true, message: 'Đăng ký thành công', user: newUser });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) return res.status(400).json({ message: 'Email không tồn tại' });
  if (user.password !== password) return res.status(400).json({ message: 'Sai mật khẩu' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
    },
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    department: req.user.department,
    role: req.user.role,
  });
});

/* =========================================================================
   REQUEST & REQUEST TYPES ROUTES (A.3)
========================================================================= */

// Lấy danh sách loại đơn đang hoạt động (kèm schema fields)
app.get('/api/request-types', (req, res) => {
  const activeTypes = requestTypes.filter((t) => t.isActive);
  return res.json(activeTypes);
});

// Lấy chi tiết 1 loại đơn theo ID
app.get('/api/request-types/:id', (req, res) => {
  const type = requestTypes.find((t) => t.id === req.params.id && t.isActive);
  if (!type) return res.status(404).json({ message: 'Không tìm thấy loại đơn' });
  return res.json(type);
});

// Lấy danh sách đồng nghiệp cùng phòng ban (để bàn giao việc)
app.get('/api/users/colleagues', authenticate, (req, res) => {
  // Lấy những user cùng phòng ban (trừ chính mình)
  const colleagues = users
    .filter((u) => u.department === req.user.department && u.id !== req.user.id)
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));
  return res.json(colleagues);
});

// Tạo đơn mới (A.3)
app.post('/api/requests', authenticate, (req, res) => {
  const { requestTypeId, formData, attachments } = req.body;

  if (!requestTypeId || !formData) {
    return res.status(400).json({ message: 'Dữ liệu đơn không hợp lệ' });
  }

  const type = requestTypes.find((t) => t.id === requestTypeId);
  if (!type) {
    return res.status(404).json({ message: 'Loại đơn không tồn tại' });
  }

  // Validate các trường bắt buộc theo schema
  for (const field of type.fields) {
    if (field.required && !formData[field.name]) {
      return res.status(400).json({ message: `Vui lòng nhập đầy đủ trường: ${field.label}` });
    }
  }

  const newRequestId = `REQ-${String(requests.length + 1).padStart(3, '0')}`;
  const newRequest = {
    id: newRequestId,
    requestTypeId,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    status: 'Chờ duyệt', // Trạng thái ban đầu bắt buộc theo mục 3
    formData,
    attachments: attachments || [],
  };

  requests.unshift(newRequest);

  // Kích hoạt thông báo cho Người duyệt cấp 1 (A.7)
  const approver = users.find(
    (u) => u.role === 'approver' && u.department === req.user.department
  ) || users.find((u) => u.role === 'approver');

  if (approver) {
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: approver.id,
      message: `Có đơn ${type.name} mới từ ${req.user.name} đang chờ bạn duyệt`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedRequestId: newRequestId,
    });
    console.log(`[NOTIF] Đã gửi thông báo tới người duyệt: ${approver.name}`);
  }

  console.log(`[REQUEST] Đã tạo đơn mới thành công: ${newRequestId} bởi ${req.user.name}`);
  return res.status(201).json({
    success: true,
    message: 'Tạo và gửi đơn thành công',
    request: newRequest,
  });
});

// Lấy danh sách đơn của chính người dùng đăng nhập (A.4 - Đơn của tôi)
app.get('/api/requests/my', authenticate, (req, res) => {
  const { status, startDate, endDate, search } = req.query;

  let list = requests.filter((r) => r.createdBy === req.user.id);

  if (status && status !== 'ALL') {
    list = list.filter((r) => r.status === status);
  }

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    list = list.filter((r) => new Date(r.createdAt) >= start);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    list = list.filter((r) => new Date(r.createdAt) <= end);
  }

  if (search) {
    const s = search.toLowerCase();
    list = list.filter((r) => r.id.toLowerCase().includes(s));
  }

  // Gắn kèm tên loại đơn
  const populated = list.map((r) => {
    const type = requestTypes.find((t) => t.id === r.requestTypeId);
    return {
      ...r,
      requestTypeName: type ? type.name : 'Loại đơn khác',
    };
  });

  return res.json(populated);
});

// Lấy chi tiết đơn yêu cầu kèm tiến trình duyệt & nhật ký (A.4 & A.5)
app.get('/api/requests/:id', authenticate, (req, res) => {
  const request = requests.find((r) => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Không tìm thấy đơn yêu cầu' });
  }

  // Kiểm tra quyền xem
  if (
    request.createdBy !== req.user.id &&
    req.user.role !== 'approver' &&
    req.user.role !== 'admin'
  ) {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập đơn này' });
  }

  const type = requestTypes.find((t) => t.id === request.requestTypeId);
  const creator = users.find((u) => u.id === request.createdBy);
  const flowConfig = approvalFlows.find((f) => f.requestTypeId === request.requestTypeId);
  const logs = approvalLogs.filter((l) => l.requestId === request.id);

  let handoverUser = null;
  if (request.formData?.handoverUserId) {
    handoverUser = users.find((u) => u.id === request.formData.handoverUserId);
  }

  return res.json({
    ...request,
    requestType: type || null,
    requestTypeName: type ? type.name : 'Loại đơn khác',
    creator: creator
      ? {
          id: creator.id,
          name: creator.name,
          email: creator.email,
          department: creator.department,
          role: creator.role,
        }
      : null,
    handoverUser: handoverUser
      ? {
          id: handoverUser.id,
          name: handoverUser.name,
          email: handoverUser.email,
        }
      : null,
    flow: flowConfig ? flowConfig.steps : [],
    logs: logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
  });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Backend Express đang chạy tại: http://localhost:${PORT}`);
  console.log(`- API RequestTypes: http://localhost:${PORT}/api/request-types`);
  console.log(`===============================================`);
});
