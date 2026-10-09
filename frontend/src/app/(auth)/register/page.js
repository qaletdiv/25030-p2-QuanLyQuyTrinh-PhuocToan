'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from '@/actions/auth.actions';
import Spinner from '@/components/Spinner';

const DEPARTMENTS = [
  'Kỹ thuật & Công nghệ',
  'Nhân sự (HR)',
  'Kế toán - Tài chính',
  'Kinh doanh & Tiếp thị',
  'Vận hành',
];

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-2 text-center">
        Đăng ký tài khoản
      </h2>

      {/* Hiển thị lỗi từ Server Action (CSS thuần) */}
      {state?.error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-2">
        {/* Họ tên */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-0.5">
            Họ và tên
          </label>
          <input
            type="text"
            name="name"
            required
            disabled={isPending}
            placeholder="Nhập họ và tên..."
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-0.5">
            Email doanh nghiệp
          </label>
          <input
            type="email"
            name="email"
            required
            disabled={isPending}
            placeholder="Nhập email doanh nghiệp..."
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
          />
        </div>

        {/* Phòng ban */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-0.5">
            Phòng ban
          </label>
          <select
            name="department"
            disabled={isPending}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 disabled:bg-slate-100"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Mật khẩu */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-0.5">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            required
            disabled={isPending}
            placeholder="Nhập mật khẩu..."
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
          />
        </div>

        {/* Xác nhận mật khẩu */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-0.5">
            Xác nhận mật khẩu
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            disabled={isPending}
            placeholder="Nhập lại mật khẩu..."
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
          />
        </div>

        {/* Nút bấm */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-150 disabled:bg-blue-400 flex items-center justify-center shadow-sm"
        >
          {isPending ? <Spinner size="sm" text="Đang đăng ký..." /> : 'Đăng ký tài khoản'}
        </button>
      </form>

      <p className="mt-3 text-center text-xs text-slate-600">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
