import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { bgImage } from '../../assets';
import { useAuth, useLeague } from '../../hooks';
import { isMockModeEnabled } from '../../utils';
// import { DevToolsPanel } from './DevToolsPanel';
import { LeaguePicture } from './LeaguePicture';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const AppLayout = ({ children, className = '' }: AppLayoutProps) => {
  const { userData } = useAuth();
  const { selectedLeague } = useLeague();
  const mockMode = isMockModeEnabled();

  const mobileNavItems = [
    {
      to: userData ? `/${userData.userName}` : '/',
      icon: '⚽',
      label: userData ? 'Mis pronósticos' : 'Todos los partidos',
    },
    { to: '/leaderboard', icon: '🥇', label: 'Podio' },
    { to: '/standings', icon: '#', label: 'Tabla' },
    // { to: '/leagues', icon: '🏆', label: 'Leagues' },
  ];

  // Fallback: hide splash after 1 second (for pages without data loading)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.hideSplash?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0, 43, 55, 0.96) 0%, rgba(0, 43, 55, 0.62) 22%, rgba(0, 87, 74, 0.28) 55%, rgba(2, 23, 29, 0.94) 100%), radial-gradient(circle at top, rgba(0, 217, 121, 0.16), transparent 30%), url(${bgImage})`,
        }}
      />
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 opacity-[0.14] blur-[1px] sm:top-12 sm:h-[560px] sm:w-[560px] md:left-[58%] md:top-10 md:h-[720px] md:w-[720px]"
          style={{
            backgroundImage: 'url("/Círculo Verde Oscuro (2).png")',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
          }}
        />
      </div>
      {/* Layout container */}
      <div className="flex min-h-screen overflow-x-hidden text-white">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile header + content */}
        <div className="flex-1 min-w-0 flex flex-col md:block">
          {/* Mobile header */}
          <header
            className="md:hidden sticky top-0 z-20 backdrop-blur-lg px-4 py-0"
            style={{
              backgroundColor: 'var(--app-panel-strong)',
              borderBottom: '1px solid var(--app-border)',
              paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
            }}
          >
            <div className="flex items-center justify-between pb-3">
              <Link
                to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
                className="flex items-center gap-2"
              >
                {selectedLeague ? (
                  <>
                    <LeaguePicture
                      src={selectedLeague.imageURL}
                      name={selectedLeague.name}
                      size="sm"
                    />
                    <span className="text-white font-medium text-sm truncate max-w-48">
                      {selectedLeague.name}
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src="/iqfutbol.png"
                      alt="IQ Futbol"
                      className="h-8 w-8 shrink-0 object-contain"
                    />
                    <div className="min-w-0 leading-none">
                      <span className="block truncate text-sm font-semibold tracking-[0.01em] text-white">
                        IQ Futbol
                      </span>
                      <span className="block truncate pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
                        Prode FIFA 2026
                      </span>
                    </div>
                  </div>
                )}
              </Link>
              <UserMenu mobile />
            </div>
          </header>

          <main className={`flex-1 min-w-0 overflow-x-hidden pb-20 md:pb-0 ${className}`}>
            {mockMode && (
              <div
                className="sticky top-0 z-10 text-center text-sm font-medium px-4 py-2"
                style={{
                  backgroundColor: 'var(--brand-accent)',
                  color: 'var(--brand-ink)',
                }}
              >
                Modo prueba: partidos mock y pronosticos de prueba compartidos.
              </div>
            )}
            {children}
          </main>

          {/* Mobile bottom navigation */}
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-20 backdrop-blur-lg"
            style={{
              backgroundColor: 'var(--app-panel-strong)',
              borderTop: '1px solid var(--app-border)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="flex justify-around items-center py-2">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/70'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px]">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Dev Tools (only in dev mode for admins) */}
      {/* <DevToolsPanel /> */}
    </>
  );
};
