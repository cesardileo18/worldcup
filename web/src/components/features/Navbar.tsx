import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';

const mobileDots = [
  'left-[2%] top-[68%] h-0.5 w-0.5',
  'left-[31%] top-[25%] h-0.5 w-0.5',
  'left-[34%] top-[54%] h-1 w-1',
  'left-[39%] top-[44%] h-0.5 w-0.5',
  'left-[43%] top-[69%] h-0.5 w-0.5',
  'left-[48%] top-[22%] h-0.5 w-0.5',
  'left-[51%] top-[50%] h-0.5 w-0.5',
  'left-[56%] top-[34%] h-0.5 w-0.5',
  'left-[60%] top-[65%] h-0.5 w-0.5',
  'left-[63%] top-[48%] h-0.5 w-0.5',
];

const mobileRingDots = [
  'left-[40%] top-[21%] h-1 w-1',
  'left-[42%] top-[60%] h-0.5 w-0.5',
];

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 shrink-0">
      <div className="relative hidden h-[76px] w-full overflow-hidden border-b border-white/10 bg-[#003643] md:block">
        <div className="absolute inset-0 bg-linear-to-r from-[#002f3a] via-[#003f42] to-[#003643]" />
        <Link
          to="/"
          aria-label="Ir a la pantalla principal"
          className="absolute left-10 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-85"
        >
          <img
            src="/iqfutbol.png"
            alt="IQ Futbol"
            className="h-16 w-16 object-contain"
          />
        </Link>
        <Link
          to="/"
          aria-label="Ir a la pantalla principal"
          className="absolute right-[12%] top-1/2 -translate-y-1/2 transition-opacity hover:opacity-85"
        >
          <img
            src="/DataIQ-Logo1.png"
            alt="DataIQ"
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <div
        className="relative h-[76px] overflow-hidden border-b border-white/10 bg-[#003643] px-5 md:hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="absolute inset-0 bg-[#003643]" />
        <div className="absolute inset-0 bg-linear-to-r from-[#002f3a] via-[#003f42] to-[#003643]" />

        {mobileDots.map((className) => (
          <span
            key={className}
            className={`absolute rounded-full bg-white ${className}`}
          />
        ))}
        {mobileRingDots.map((className) => (
          <span
            key={className}
            className={`absolute rounded-full border border-white ${className}`}
          />
        ))}

        <div className="relative z-10 flex h-full items-center justify-between gap-4">
          <UserMenu mobile />
          <Link
            to="/"
            aria-label="Ir a la pantalla principal"
            className="shrink-0 transition-opacity hover:opacity-85"
          >
            <img
              src="/DataIQ-Logo1.png"
              alt="DataIQ"
              className="h-5 w-auto"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
