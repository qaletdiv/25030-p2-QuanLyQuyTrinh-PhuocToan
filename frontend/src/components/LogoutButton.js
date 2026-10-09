'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/actions/auth.actions';
import Spinner from '@/components/Spinner';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200/80 px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-2xs"
    >
      {isPending ? <Spinner size="sm" text="Đang thoát..." /> : 'Đăng xuất'}
    </button>
  );
}
