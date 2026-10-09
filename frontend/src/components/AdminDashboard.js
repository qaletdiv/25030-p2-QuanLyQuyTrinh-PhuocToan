export default function AdminDashboard() {
  const departments = [
    { name: 'Kỹ thuật & Công nghệ', users: 24 },
    { name: 'Kế toán - Tài chính', users: 8 },
    { name: 'Nhân sự (HR)', users: 5 },
    { name: 'Kinh doanh & Tiếp thị', users: 15 },
    { name: 'Vận hành', users: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* 3 Thẻ thống kê toàn hệ thống */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border bg-purple-50 text-purple-800 border-purple-200">
          <p className="text-sm font-medium opacity-80">Tổng lượt tạo đơn</p>
          <p className="text-3xl font-bold mt-2">142</p>
        </div>
        <div className="p-5 rounded-xl border bg-blue-50 text-blue-800 border-blue-200">
          <p className="text-sm font-medium opacity-80">Tài khoản hoạt động</p>
          <p className="text-3xl font-bold mt-2">62</p>
        </div>
        <div className="p-5 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200">
          <p className="text-sm font-medium opacity-80">
            Tỷ lệ duyệt thành công
          </p>
          <p className="text-3xl font-bold mt-2">88.5%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tỷ lệ loại đơn */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Tỷ lệ các loại đơn
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">
                  Đơn nghỉ phép
                </span>
                <span className="text-slate-500">65% (92 đơn)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-[65%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Đơn mua hàng</span>
                <span className="text-slate-500">35% (50 đơn)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full w-[35%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Số tài khoản theo phòng ban */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Tài khoản theo phòng ban
          </h2>
          <div className="divide-y divide-slate-100 text-sm">
            {departments.map((d) => (
              <div
                key={d.name}
                className="py-2.5 flex items-center justify-between"
              >
                <span className="text-slate-700">{d.name}</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                  {d.users} tài khoản
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

