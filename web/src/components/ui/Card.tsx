type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div
      className={`relative rounded-lg border backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:w-[80%] after:h-8 after:bg-linear-to-b after:from-black/40 after:to-transparent after:blur-md after:rounded-[100%] ${className}`}
      style={{
        borderColor: 'var(--app-border)',
        background:
          'linear-gradient(180deg, rgba(0, 87, 74, 0.12), rgba(0, 43, 55, 0.62))',
      }}
    >
      {children}
    </div>
  );
};
