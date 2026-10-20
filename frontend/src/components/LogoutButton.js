'use client';

import { useTransition } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
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
      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200/80 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-2xs"
      title="Đăng xuất khỏi hệ thống"
    >
      {isPending ? (
        <Spinner size="sm" text="Đang thoát..." />
      ) : (
        <>
          <FontAwesomeIcon icon={faRightFromBracket} className="w-3 h-3" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </>
      )}
    </button>
  );
}
