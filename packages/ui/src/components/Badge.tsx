import React from 'react';

export type BadgeVariant = 'simulated' | 'demo' | 'grade_a' | 'grade_b' | 'grade_c' | 'outline' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full tracking-wide uppercase tabular-nums select-none';

  const variantClasses: Record<BadgeVariant, string> = {
    simulated: 'bg-amber-100/80 text-amber-900 border border-dashed border-amber-400 font-mono font-semibold',
    demo: 'bg-stone-200 text-stone-800 border border-stone-300 font-mono',
    grade_a: 'bg-[#eaf4ed] text-[#1f6b3a] border border-[#1f6b3a]/20 font-bold',
    grade_b: 'bg-[#fef3c7] text-[#b45309] border border-[#b45309]/20 font-bold',
    grade_c: 'bg-[#fee2e2] text-[#b91c1c] border border-[#b91c1c]/20 font-bold',
    outline: 'bg-transparent text-ink border border-border',
    neutral: 'bg-surface text-ink-muted',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {variant === 'simulated' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />}
      {children}
    </span>
  );
};
