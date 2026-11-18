import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'sell' | 'hold' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'touch';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] select-none';

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    touch: 'px-6 py-4 text-base min-h-[56px] w-full font-semibold', // For primary farmer actions
  };

  const variantClasses: Record<string, string> = {
    primary: 'bg-accent text-accent-ink hover:bg-action-hover focus:ring-accent shadow-sm',
    secondary: 'bg-surface text-ink hover:bg-border/40 focus:ring-ink/20 border border-border',
    sell: 'bg-[#1f6b3a] text-white hover:bg-[#17522c] focus:ring-[#1f6b3a] shadow-sm',
    hold: 'bg-[#b45309] text-white hover:bg-[#92400e] focus:ring-[#b45309] shadow-sm',
    outline: 'bg-transparent text-ink border border-border hover:bg-surface focus:ring-ink/20',
    ghost: 'bg-transparent text-ink hover:bg-surface focus:ring-transparent',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex mr-2 shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
