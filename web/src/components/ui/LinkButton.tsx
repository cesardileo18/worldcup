import { Link, type LinkProps } from 'react-router-dom';

type LinkButtonProps = LinkProps & {
  variant?: 'primary' | 'secondary';
};

export const LinkButton = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: LinkButtonProps) => {
  const baseStyles =
    'flex items-center justify-center rounded-full font-bold py-2 px-4 focus:outline-none hover:cursor-pointer transition-all duration-300';
  const variants = {
    primary:
      'border text-white shadow-[0_12px_30px_-12px_rgba(0,217,121,0.55)] hover:-translate-y-0.5 hover:brightness-105',
    secondary: 'text-white/60 hover:text-white',
  };

  return (
    <Link
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={
        variant === 'primary'
          ? {
              backgroundColor: 'rgba(0, 87, 74, 0.28)',
              borderColor: 'rgba(0, 217, 121, 0.36)',
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Link>
  );
};
