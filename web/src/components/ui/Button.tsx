import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({
  className = '',
  children,
  variant = 'primary',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'flex items-center justify-center rounded-full font-bold py-2 px-4 focus:outline-none transition-all duration-300';
  const variants = {
    primary:
      'border text-white shadow-[0_12px_30px_-12px_rgba(0,217,121,0.55)] hover:-translate-y-0.5 hover:brightness-105',
    secondary: 'text-white/60 hover:text-white',
  };
  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed'
    : 'hover:cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
      style={
        variant === 'primary'
          ? {
              backgroundColor: 'rgba(0, 87, 74, 0.28)',
              borderColor: 'rgba(0, 217, 121, 0.36)',
            }
          : undefined
      }
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
