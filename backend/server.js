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
  const { name, email, password, department } = req.body;
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
    role: 'employee',
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

  // Chuẩn hóa dữ liệu mảng items và số tiền totalAmount nếu có
  if (typeof formData.items === 'string') {
    try {
      formData.items = JSON.parse(formData.items);
    } catch (e) {}
  }
  if (formData.totalAmount) {
    formData.totalAmount = Number(formData.totalAmount);
  }

  // Validate các trường bắt buộc theo schema
  for (const field of type.fields) {
    if (field.required && !formData[field.name]) {
      return res.status(400).json({ message: `Vui lòng nhập đầy đủ trường: ${field.label}` });
    }
  }

  // Validate ngày nếu có (Đơn nghỉ phép)
  if (formData.startDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (formData.startDate < todayStr) {
      return res.status(400).json({ message: 'Ngày bắt đầu nghỉ không được ở trong quá khứ' });
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      return res.status(400).json({ message: 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu' });
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

// Helper tính toán các cấp duyệt thực tế (hỗ trợ điều kiện rẽ nhánh conditionalRules)
function getEffectiveFlowSteps(requestTypeId, formData) {
  const flowConfig = approvalFlows.find((f) => f.requestTypeId === requestTypeId);
  if (!flowConfig) return [];
  const steps = [...(flowConfig.steps || []).map((s) => ({ ...s }))];

  if (Array.isArray(flowConfig.conditionalRules)) {
    for (const rule of flowConfig.conditionalRules) {
      if (rule.isActive !== false) {
        const val = Number(formData?.[rule.field] || 0);
        let conditionMet = false;
        if (rule.operator === '>' && val > Number(rule.value)) conditionMet = true;
        if (rule.operator === '>=' && val >= Number(rule.value)) conditionMet = true;
        if (rule.operator === '<' && val < Number(rule.value)) conditionMet = true;
        if (rule.operator === '<=' && val <= Number(rule.value)) conditionMet = true;
        if (rule.operator === '==' && val === Number(rule.value)) conditionMet = true;

        if (conditionMet && rule.insertStep) {
          if (!steps.some((s) => s.title === rule.insertStep.title || s.level === rule.insertStep.level)) {
            steps.push({ ...rule.insertStep, isConditional: true });
          }
        }
      }
    }
  }

  steps.sort((a, b) => a.level - b.level);
  return steps;
}

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
  const effectiveSteps = getEffectiveFlowSteps(request.requestTypeId, request.formData);
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
    flow: effectiveSteps,
    logs: logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
  });
});

/* =========================================================================
   APPROVAL ROUTES (A.5 — Danh sách duyệt đơn & Xử lý phê duyệt)
========================================================================= */

// Lấy danh sách đơn cần duyệt và lịch sử duyệt của Approver
app.get('/api/approvals', authenticate, (req, res) => {
  if (req.user.role !== 'approver' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập danh sách duyệt đơn' });
  }

  const { tab, search } = req.query; // tab = 'pending' | 'history'

  // Helper để format đơn kèm thông tin
  const formatRequest = (r) => {
    const type = requestTypes.find((t) => t.id === r.requestTypeId);
    const creator = users.find((u) => u.id === r.createdBy);
    const effectiveSteps = getEffectiveFlowSteps(r.requestTypeId, r.formData);
    const currentStep = effectiveSteps.find((s) => s.level === (r.currentLevel || 1));

    return {
      ...r,
      requestTypeName: type ? type.name : 'Loại đơn khác',
      creator: creator
        ? {
            id: creator.id,
            name: creator.name,
            email: creator.email,
            department: creator.department,
          }
        : null,
      currentStepTitle: currentStep ? currentStep.title : `Cấp ${r.currentLevel || 1}`,
      totalSteps: effectiveSteps.length || 1,
    };
  };

  // 1. Danh sách chờ xử lý (Pending)
  // Chỉ hiện đơn đang ở đúng bước mà user hiện tại được phân quyền xử lý
  const pendingList = requests
    .filter((r) => {
      // Đơn phải chưa kết thúc
      if (r.status === 'Đã duyệt hoàn tất' || r.status === 'Bị từ chối') {
        return false;
      }

      // Admin duyệt được tất cả
      if (req.user.role === 'admin') return true;

      const effectiveSteps = getEffectiveFlowSteps(r.requestTypeId, r.formData);
      if (!effectiveSteps.length) return true;

      const currentStep = effectiveSteps.find((s) => s.level === (r.currentLevel || 1));
      if (!currentStep) return false;

      const creator = users.find((u) => u.id === r.createdBy);

      // Nếu bước 1 (Trưởng phòng): user phải cùng phòng ban với người tạo đơn (hoặc là approver phòng đó)
      if (currentStep.level === 1) {
        return req.user.department === creator?.department;
      }

      // Nếu bước 2 (HR): user phải thuộc phòng Nhân sự
      if (currentStep.title?.includes('Nhân sự') || (r.requestTypeId === 'rt-leave' && currentStep.level === 2)) {
        return req.user.department === 'Nhân sự & Hành chính';
      }

      // Nếu bước CFO hoặc cấp rẽ nhánh khác
      return true;
    })
    .map(formatRequest);

  // 2. Danh sách đã xử lý (History)
  // Các đơn mà approver này đã từng ký duyệt hoặc từ chối
  const myLogs = approvalLogs.filter((l) => l.approverId === req.user.id);
  const myProcessedRequestIds = new Set(myLogs.map((l) => l.requestId));

  const historyList = requests
    .filter((r) => myProcessedRequestIds.has(r.id))
    .map((r) => {
      const formatted = formatRequest(r);
      const myLog = myLogs.find((l) => l.requestId === r.id);
      return {
        ...formatted,
        myAction: myLog ? myLog.action : null,
        myNote: myLog ? myLog.note : null,
        processedAt: myLog ? myLog.timestamp : null,
      };
    });

  // Áp dụng tìm kiếm nếu có
  let resultPending = pendingList;
  let resultHistory = historyList;

  if (search) {
    const s = search.toLowerCase();
    resultPending = resultPending.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.creator?.name?.toLowerCase().includes(s) ||
        r.requestTypeName?.toLowerCase().includes(s)
    );
    resultHistory = resultHistory.filter(
      (r) =>
        r.id.toLowerCase().includes(s) ||
        r.creator?.name?.toLowerCase().includes(s) ||
        r.requestTypeName?.toLowerCase().includes(s)
    );
  }

  return res.json({
    pending: resultPending,
    history: resultHistory,
    counts: {
      pending: pendingList.length,
      history: historyList.length,
    },
  });
});

// Phê duyệt đơn (Approve - A.5)
app.post('/api/requests/:id/approve', authenticate, (req, res) => {
  if (req.user.role !== 'approver' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền phê duyệt đơn' });
  }

  const request = requests.find((r) => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Không tìm thấy đơn yêu cầu' });
  }

  if (request.status === 'Đã duyệt hoàn tất' || request.status === 'Bị từ chối') {
    return res.status(400).json({ message: 'Đơn này đã hoàn tất hoặc đã bị từ chối trước đó' });
  }

  const { note } = req.body;
  const currentLvl = request.currentLevel || 1;
  const effectiveSteps = getEffectiveFlowSteps(request.requestTypeId, request.formData);

  // 1. Ghi nhật ký duyệt
  const newLog = {
    id: `log-${Date.now()}`,
    requestId: request.id,
    level: currentLvl,
    approverId: req.user.id,
    approverName: req.user.name,
    action: 'approve',
    note: note ? note.trim() : 'Đồng ý phê duyệt.',
    timestamp: new Date().toISOString(),
  };
  approvalLogs.push(newLog);

  // 2. Chuyển cấp hoặc hoàn tất
  const nextLevel = currentLvl + 1;
  const nextStep = effectiveSteps.find((s) => s.level === nextLevel);

  if (nextStep) {
    request.currentLevel = nextLevel;
    request.status = `Đang duyệt cấp ${nextLevel}`;

    // Tạo thông báo cho người duyệt cấp tiếp theo (A.7)
    let nextApprover = null;
    if (nextStep.title?.includes('Nhân sự')) {
      nextApprover = users.find((u) => u.role === 'approver' && u.department === 'Nhân sự & Hành chính');
    } else {
      nextApprover = users.find((u) => u.role === 'approver' && u.id !== req.user.id);
    }

    if (nextApprover) {
      notifications.push({
        id: `notif-${Date.now()}`,
        userId: nextApprover.id,
        message: `Có đơn ${request.id} từ ${request.createdBy} đang chờ bạn duyệt ở cấp ${nextLevel}: ${nextStep.title}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        relatedRequestId: request.id,
      });
    }
  } else {
    request.status = 'Đã duyệt hoàn tất';

    // Thông báo cho người tạo đơn (A.7)
    notifications.push({
      id: `notif-${Date.now()}`,
      userId: request.createdBy,
      message: `Đơn ${request.id} của bạn đã được ${req.user.name} phê duyệt hoàn tất`,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedRequestId: request.id,
    });
  }

  console.log(`[APPROVE] ${req.user.name} đã duyệt đơn ${request.id} -> Trạng thái: ${request.status}`);

  return res.json({
    success: true,
    message: 'Phê duyệt đơn thành công',
    request,
  });
});

// Từ chối đơn (Reject - A.5: BẮT BUỘC nhập lý do)
app.post('/api/requests/:id/reject', authenticate, (req, res) => {
  if (req.user.role !== 'approver' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền từ chối đơn' });
  }

  const request = requests.find((r) => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ message: 'Không tìm thấy đơn yêu cầu' });
  }

  if (request.status === 'Đã duyệt hoàn tất' || request.status === 'Bị từ chối') {
    return res.status(400).json({ message: 'Đơn này đã hoàn tất hoặc đã bị từ chối trước đó' });
  }

  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Bắt buộc phải nhập lý do khi từ chối đơn' });
  }

  const currentLvl = request.currentLevel || 1;

  // 1. Ghi nhật ký từ chối
  const newLog = {
    id: `log-${Date.now()}`,
    requestId: request.id,
    level: currentLvl,
    approverId: req.user.id,
    approverName: req.user.name,
    action: 'reject',
    note: reason.trim(),
    timestamp: new Date().toISOString(),
  };
  approvalLogs.push(newLog);

  // 2. Chuyển trạng thái sang Bị từ chối và dừng quy trình
  request.status = 'Bị từ chối';

  // 3. Tạo thông báo cho người tạo đơn kèm lý do cụ thể (A.7)
  notifications.push({
    id: `notif-${Date.now()}`,
    userId: request.createdBy,
    message: `Đơn ${request.id} của bạn đã bị từ chối bởi ${req.user.name}. Lý do: ${reason.trim()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
    relatedRequestId: request.id,
  });

  console.log(`[REJECT] ${req.user.name} đã từ chối đơn ${request.id}. Lý do: ${reason.trim()}`);

  return res.json({
    success: true,
    message: 'Đã từ chối đơn thành công',
    request,
  });
});

/* =========================================================================
   ADMIN ROUTES (A.6 — Quản lý loại đơn & Cấu hình luồng duyệt)
========================================================================= */

// 1. Lấy toàn bộ danh sách loại đơn (bao gồm cả loại đơn đã ẩn)
app.get('/api/admin/request-types', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }
  return res.json(requestTypes);
});

// Thống kê Dashboard cho Admin (A.2)
app.get('/api/admin/dashboard-stats', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const totalRequests = requests.length;
  const activeUsers = users.length;
  const approvedCount = requests.filter((r) => r.status === 'Đã duyệt hoàn tất').length;
  const rejectedCount = requests.filter((r) => r.status === 'Bị từ chối').length;
  const processed = approvedCount + rejectedCount;
  const successRate = processed > 0 ? ((approvedCount / processed) * 100).toFixed(1) : '100';

  const leaveCount = requests.filter((r) => r.requestTypeId === 'rt-leave').length;
  const purchaseCount = requests.filter((r) => r.requestTypeId === 'rt-purchase').length;

  const deptMap = {};
  for (const u of users) {
    const dept = u.department || 'Chung';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  }
  const departments = Object.entries(deptMap).map(([name, count]) => ({
    name,
    users: count,
  }));

  return res.json({
    totalRequests,
    activeUsers,
    successRate: `${successRate}%`,
    requestTypeStats: {
      leave: leaveCount,
      purchase: purchaseCount,
      total: totalRequests || 1,
    },
    departments,
  });
});

// 2. Thêm loại đơn mới (A.6)
app.post('/api/admin/request-types', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const { name, description, isActive } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Tên loại đơn không được để trống' });
  }

  const newType = {
    id: `rt-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    fields: [],
  };

  requestTypes.push(newType);

  // Tạo mặc định 1 luồng duyệt cơ bản cho loại đơn này
  approvalFlows.push({
    requestTypeId: newType.id,
    steps: [{ level: 1, title: 'Trưởng phòng phê duyệt', approverRole: 'approver' }],
    conditionalRules: [],
  });

  return res.status(201).json({
    success: true,
    message: 'Tạo loại đơn mới thành công',
    requestType: newType,
  });
});

// 3. Cập nhật loại đơn (A.6)
app.put('/api/admin/request-types/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const type = requestTypes.find((t) => t.id === req.params.id);
  if (!type) {
    return res.status(404).json({ message: 'Không tìm thấy loại đơn' });
  }

  const { name, description, isActive } = req.body;
  if (name !== undefined) type.name = name.trim();
  if (description !== undefined) type.description = description.trim();
  if (isActive !== undefined) type.isActive = Boolean(isActive);

  return res.json({
    success: true,
    message: 'Cập nhật loại đơn thành công',
    requestType: type,
  });
});

// 4. Bật / Tắt trạng thái ẩn/hiện loại đơn (Toggle Active)
app.patch('/api/admin/request-types/:id/toggle', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const type = requestTypes.find((t) => t.id === req.params.id);
  if (!type) {
    return res.status(404).json({ message: 'Không tìm thấy loại đơn' });
  }

  type.isActive = !type.isActive;

  return res.json({
    success: true,
    message: `Đã ${type.isActive ? 'hiển thị' : 'ẩn'} loại đơn thành công`,
    requestType: type,
  });
});

// 5. Xóa loại đơn (Delete)
app.delete('/api/admin/request-types/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const index = requestTypes.findIndex((t) => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Không tìm thấy loại đơn' });
  }

  // Nếu đang có đơn sử dụng loại đơn này thì chuyển sang ẩn thay vì xóa cứng
  const hasRequests = requests.some((r) => r.requestTypeId === req.params.id);
  if (hasRequests) {
    requestTypes[index].isActive = false;
    return res.json({
      success: true,
      message: 'Loại đơn này đã phát sinh đơn trong hệ thống nên đã được tự động chuyển sang trạng thái Ẩn thay vì xóa hẳn.',
    });
  }

  requestTypes.splice(index, 1);
  return res.json({
    success: true,
    message: 'Đã xóa loại đơn thành công',
  });
});

// 6. Lấy toàn bộ cấu hình luồng duyệt
app.get('/api/admin/approval-flows', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const populated = approvalFlows.map((flow) => {
    const type = requestTypes.find((t) => t.id === flow.requestTypeId);
    return {
      ...flow,
      requestTypeName: type ? type.name : 'Loại đơn khác',
      isTypeActive: type ? type.isActive : false,
    };
  });

  return res.json(populated);
});

// 7. Cập nhật cấu hình luồng duyệt & điều kiện rẽ nhánh cho 1 loại đơn (A.6)
app.put('/api/admin/approval-flows/:requestTypeId', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên' });
  }

  const { steps, conditionalRules } = req.body;
  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ message: 'Luồng duyệt phải có ít nhất 1 cấp duyệt' });
  }

  let flow = approvalFlows.find((f) => f.requestTypeId === req.params.requestTypeId);
  if (!flow) {
    flow = {
      requestTypeId: req.params.requestTypeId,
      steps: [],
      conditionalRules: [],
    };
    approvalFlows.push(flow);
  }

  // Format lại cấp thứ tự 1, 2, 3...
  flow.steps = steps.map((s, index) => ({
    level: index + 1,
    title: s.title || `Cấp ${index + 1}`,
    approverRole: s.approverRole || 'approver',
  }));

  if (Array.isArray(conditionalRules)) {
    flow.conditionalRules = conditionalRules;
  }

  return res.json({
    success: true,
    message: 'Cập nhật cấu hình luồng duyệt thành công',
    flow,
  });
});

/* =========================================================================
   NOTIFICATION ROUTES (A.7 — Hệ thống thông báo)
========================================================================= */

// Lấy danh sách thông báo của người dùng đăng nhập
app.get('/api/notifications', authenticate, (req, res) => {
  const userNotifs = notifications
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  return res.json({
    notifications: userNotifs,
    unreadCount,
  });
});

// Đánh dấu 1 thông báo là đã đọc
app.patch('/api/notifications/:id/read', authenticate, (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id && n.userId === req.user.id);
  if (!notif) {
    return res.status(404).json({ message: 'Không tìm thấy thông báo' });
  }

  notif.isRead = true;
  return res.json({ success: true, message: 'Đã đánh dấu đọc', notification: notif });
});

// Đánh dấu toàn bộ thông báo của user là đã đọc
app.post('/api/notifications/mark-all-read', authenticate, (req, res) => {
  notifications
    .filter((n) => n.userId === req.user.id)
    .forEach((n) => {
      n.isRead = true;
    });

  return res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Backend Express đang chạy tại: http://localhost:${PORT}`);
  console.log(`- API RequestTypes: http://localhost:${PORT}/api/request-types`);
  console.log(`===============================================`);
});
