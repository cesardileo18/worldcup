type ChipProps = {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export const Chip = ({ active = false, onClick, children }: ChipProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
        active
          ? 'text-[var(--brand-ink)]'
          : 'text-white/70 hover:text-white'
      }`}
      style={
        active
          ? {
              backgroundColor: 'var(--brand-accent)',
              borderColor: 'rgba(0, 217, 121, 0.2)',
            }
          : {
              backgroundColor: 'rgba(227, 238, 232, 0.08)',
              borderColor: 'var(--app-border)',
            }
      }
    >
      {children}
    </button>
  );
};
