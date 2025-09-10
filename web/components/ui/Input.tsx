'use client';

import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={[
      'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100',
      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
      className,
    ].join(' ')}
    {...props}
  />
));
Input.displayName = 'Input';

