import Link from 'next/link';

export default function ApproverDashboard() {
  const pendingApprovals = [
    {
      id: 'REQ-101',
      applicant: 'Trần Văn Bình',
      department: 'Kỹ thuật',
      type: 'Đơn mua hàng',
      date: '2026-10-07',
    },
    {
      id: 'REQ-102',
      applicant: 'Lê Thị Hoa',
      department: 'Kỹ thuật',
      type: 'Đơn nghỉ phép',
      date: '2026-10-06',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border bg-amber-50 text-amber-800 border-amber-200">
          <p className="text-sm font-medium opacity-80">
            Đơn đang chờ bạn duyệt
          </p>
          <p className="text-3xl font-bold mt-2">{pendingApprovals.length}</p>
        </div>
        <div className="p-5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200">
          <p className="text-sm font-medium opacity-80">
            Đã phê duyệt tháng này
          </p>
          <p className="text-3xl font-bold mt-2">18</p>
        </div>
      </div>

      {/* Danh sách 5 đơn mới nhất cần xử lý */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            Đơn chờ bạn xử lý
          </h2>
          <Link
            href="/approvals"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Xem toàn bộ hàng đợi →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Người gửi</th>
                <th className="py-3 px-4">Phòng ban</th>
                <th className="py-3 px-4">Loại đơn</th>
                <th className="py-3 px-4">Ngày gửi</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingApprovals.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.id}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{item.applicant}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.department}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{item.type}</td>
                  <td className="py-3 px-4 text-slate-500">{item.date}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/approvals/${item.id}`}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      Xử lý ngay
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

