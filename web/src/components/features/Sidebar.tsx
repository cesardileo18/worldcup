import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { LeaderboardList } from './LeaderboardList';
import { UserMenu } from './UserMenu';

const sidebarDots = [
  'left-[8%] top-[35%] h-1 w-1',
  'left-[34%] top-[18%] h-1.5 w-1.5',
  'left-[28%] top-[28%] h-0.5 w-0.5',
  'left-[52%] top-[22%] h-1.5 w-1.5',
  'left-[58%] top-[18%] h-1 w-1',
  'left-[66%] top-[20%] h-1 w-1',
  'left-[17%] top-[42%] h-1 w-1',
  'left-[31%] top-[46%] h-1 w-1',
  'left-[73%] top-[39%] h-1 w-1',
  'left-[58%] top-[43%] h-1 w-1',
  'left-[24%] top-[54%] h-0.5 w-0.5',
  'left-[45%] top-[53%] h-0.5 w-0.5',
  'left-[62%] top-[57%] h-0.5 w-0.5',
  'left-[86%] top-[48%] h-1 w-1',
  'left-[12%] top-[64%] h-0.5 w-0.5',
  'left-[33%] top-[64%] h-0.5 w-0.5',
  'left-[78%] top-[68%] h-0.5 w-0.5',
  'left-[40%] top-[72%] h-2.5 w-2.5',
  'left-[55%] top-[78%] h-1 w-1',
  'left-[69%] top-[81%] h-1 w-1',
  'left-[89%] top-[76%] h-0.5 w-0.5',
];

const sidebarRingDots = [
  'left-[47%] top-[13%] h-2.5 w-2.5',
  'left-[20%] top-[73%] h-3 w-3',
  'left-[80%] top-[18%] h-2 w-2',
];

export const Sidebar = () => {
  return (
    <aside className="w-80 shrink-0 p-2 h-[calc(100vh-76px)] sticky top-[76px]">
      <Card className="h-full max-h-[calc(100vh-76px-1rem)] flex flex-col rounded-xl after:hidden overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 43, 55, 0.38), rgba(0, 87, 74, 0.2) 44%, rgba(0, 43, 55, 0.58) 100%)',
          }}
        />
        <div className="relative w-full shrink-0 flex flex-col overflow-hidden pb-1">
          <div className="absolute inset-0 bg-linear-to-b from-[#002b37] via-[#003f42] to-[#002b37]" />
          {sidebarDots.map((className) => (
            <span
              key={className}
              className={`absolute rounded-full bg-white ${className}`}
            />
          ))}
          {sidebarRingDots.map((className) => (
            <span
              key={className}
              className={`absolute rounded-full border-2 border-white/80 ${className}`}
            />
          ))}
          <div className="relative z-10 flex h-20 items-start justify-center px-6 pt-3">
            <span className="rounded border border-white/15 bg-[#00574a]/35 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              Prode FIFA 2026
            </span>
          </div>
          <div className="absolute left-1/2 top-14 z-0 h-8 w-36 -translate-x-1/2 bg-[#002b37]/25 blur-sm" />
          <div className="relative z-10 px-2 pb-1">
            <UserMenu />
          </div>
        </div>
        <div className="pt-1 flex-1 min-h-0 flex flex-col">
          <LeaderboardList />
        </div>
        {/* Footer Links */}
        <div
          className="shrink-0 px-3 py-1.5"
          style={{ borderTop: '1px solid var(--app-border)' }}
        >
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <img
              src="/DataIQ-Logo1.png"
              alt="DataIQ"
              className="h-4 w-auto"
            />
            <Link
              to="/rules"
              className="text-white/50 hover:text-white transition-colors"
            >
              Reglas
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
};
