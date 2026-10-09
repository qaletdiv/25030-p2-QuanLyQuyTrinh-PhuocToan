'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth.actions';
import Spinner from '@/components/Spinner';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4 text-center">
        Đăng nhập tài khoản
      </h2>

      {/* Hiển thị lỗi từ Server Action (CSS thuần) */}
      {state?.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email doanh nghiệp
          </label>
          <input
            type="email"
            name="email"
            required
            disabled={isPending}
            placeholder="Nhập email doanh nghiệp..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            required
            disabled={isPending}
            placeholder="Nhập mật khẩu..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors duration-150 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
        >
          {isPending ? <Spinner size="sm" text="Đang xử lý..." /> : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
