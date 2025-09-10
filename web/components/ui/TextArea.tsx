'use client';

import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, Props>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    className={[
      'w-full px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100',
      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
      className,
    ].join(' ')}
    {...props}
  />
));
TextArea.displayName = 'TextArea';

