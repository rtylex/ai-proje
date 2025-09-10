'use client';

import React from 'react';

export type BannerKind = 'info' | 'success' | 'error';

export function Banner({ kind = 'info', message, onClose }: { kind?: BannerKind; message: string; onClose?: () => void }) {
  const styles: Record<BannerKind, string> = {
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-900/30',
    error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-900/30',
  };
  return (
    <div className={`flex items-start gap-3 rounded-md border px-4 py-3 ${styles[kind]}`}>
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button onClick={onClose} className="text-sm opacity-75 hover:opacity-100">Kapat</button>
      )}
    </div>
  );
}

