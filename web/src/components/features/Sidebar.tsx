import { Link, NavLink } from 'react-router-dom';
import { sidebarMenuBg } from '../../assets';
import { useLeague } from '../../hooks';
import { Card } from '../ui/Card';
import { LeaderboardList } from './LeaderboardList';
import { LeaguePicture } from './LeaguePicture';
import { UserMenu } from './UserMenu';

export const Sidebar = () => {
  const { selectedLeague } = useLeague();

  return (
    <aside className="w-80 shrink-0 p-3 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-2rem)] flex flex-col rounded-xl after:hidden overflow-hidden">
        <div className="relative w-full shrink-0 flex flex-col overflow-hidden pb-1">
          <img
            src={sidebarMenuBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <Link
            to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
            className="relative z-10 flex items-center justify-center py-3 hover:opacity-90 transition-opacity"
          >
            {selectedLeague ? (
              <LeaguePicture
                src={selectedLeague.imageURL}
                name={selectedLeague.name}
                size="xl"
                className="h-24 w-24 drop-shadow-lg"
              />
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src="/iqfutbol.png"
                  alt="IQ Futbol"
                  className="h-28 w-28 object-contain drop-shadow-lg"
                />
              </div>
            )}
          </Link>
          <div className="relative z-10 px-2 pb-2">
            <UserMenu />
          </div>
        </div>
        <div className="pt-3 flex-1 min-h-0 flex flex-col">
          <div className="px-3 pb-3 flex gap-2 text-xs">
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                `flex-1 rounded-lg border px-3 py-2 text-center transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white/55 hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                borderColor: isActive
                  ? 'rgba(0, 217, 121, 0.35)'
                  : 'var(--app-border)',
                backgroundColor: isActive
                  ? 'rgba(0, 87, 74, 0.35)'
                  : 'rgba(227, 238, 232, 0.04)',
              })}
            >
              Podio
            </NavLink>
            <NavLink
              to="/standings"
              className={({ isActive }) =>
                `flex-1 rounded-lg border px-3 py-2 text-center transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-white/55 hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                borderColor: isActive
                  ? 'rgba(0, 217, 121, 0.35)'
                  : 'var(--app-border)',
                backgroundColor: isActive
                  ? 'rgba(0, 87, 74, 0.35)'
                  : 'rgba(227, 238, 232, 0.04)',
              })}
            >
              Tabla
            </NavLink>
          </div>
          <LeaderboardList />
        </div>
        {/* Footer Links */}
        <div
          className="shrink-0 p-2"
          style={{ borderTop: '1px solid var(--app-border)' }}
        >
          <div className="mb-3 flex justify-center">
            <img
              src="/DataIQ-Logo1.png"
              alt="DataIQ"
              className="h-5 w-auto opacity-80"
            />
          </div>
          <div className="flex gap-4 justify-center text-xs">
            <Link
              to="/rules"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              Reglas
            </Link>
            {/* <Link
              to="/about"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              About
            </Link> */}
          </div>
        </div>
      </Card>
    </aside>
  );
};
