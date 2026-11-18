import React from 'react';

export type BadgeVariant =
  | 'simulated'
  | 'demo'
  | 'grade_a'
  | 'grade_b'
  | 'grade_c'
  | 'outline'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
}) => {
  const baseClasses =
    size === 'sm'
      ? 'inline-flex items-center gap-1 px-2 py-0.2 text-[10px] font-medium rounded-full tracking-wide uppercase tabular-nums select-none'
      : 'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full tracking-wide uppercase tabular-nums select-none';

  const variantClasses: Record<BadgeVariant, string> = {
    simulated: 'bg-amber-100/80 text-amber-900 border border-dashed border-amber-400 font-mono font-semibold',
    demo: 'bg-stone-200 text-stone-800 border border-stone-300 font-mono',
    grade_a: 'bg-[#eaf4ed] text-[#1f6b3a] border border-[#1f6b3a]/20 font-bold',
    grade_b: 'bg-[#fef3c7] text-[#b45309] border border-[#b45309]/20 font-bold',
    grade_c: 'bg-[#fee2e2] text-[#b91c1c] border border-[#b91c1c]/20 font-bold',
    outline: 'bg-transparent text-ink border border-border',
    neutral: 'bg-surface text-ink-muted border border-border/50',
    success: 'bg-[#eaf4ed] text-[#1f6b3a] border border-[#1f6b3a]/30 font-semibold',
    warning: 'bg-[#fef3c7] text-[#b45309] border border-[#b45309]/30 font-semibold',
    accent: 'bg-accent/10 text-accent border border-accent/30 font-semibold',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {variant === 'simulated' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
      {children}
    </span>
  );
};
