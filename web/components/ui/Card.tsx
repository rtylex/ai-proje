import React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'glass' | 'corporate' | 'elevated';
  hover?: boolean;
  loading?: boolean;
};

export function Card({ 
  className = '', 
  header, 
  footer, 
  children, 
  variant = 'default',
  hover = false,
  loading = false,
  ...rest 
}: Props) {
  const base = 'transition-all duration-300';
  const variants: Record<string, string> = {
    default: 'bg-white dark:bg-slate-900 rounded-xl shadow-soft border border-gray-100 dark:border-slate-800',
    glass: 'bg-white/10 dark:bg-slate-900/10 rounded-2xl border border-white/20 backdrop-blur-md glass-effect',
    corporate: 'bg-white/95 dark:bg-slate-900/95 rounded-2xl corporate-card',
    elevated: 'bg-white dark:bg-slate-900 rounded-2xl shadow-corporal border border-gray-200 dark:border-slate-700',
  };
  
  const hoverEffects = hover ? 'hover:shadow-corporal-lg hover:-translate-y-1' : '';
  const loadingEffects = loading ? 'loading-pulse' : '';
  
  return (
    <div className={[
      base,
      variants[variant],
      hoverEffects,
      loadingEffects,
      className,
    ].join(' ')} {...rest}>
      {header && (
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-slate-700">
          <div className="text-gray-900 dark:text-slate-100 font-semibold text-lg">
            {header}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 pb-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
}

