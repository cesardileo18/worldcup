import React from 'react';
import { createPortal } from 'react-dom';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
  auth,
  signInWithDomainCheck,
  UnauthorizedDomainError,
} from '../../firebase';
import { sidebarMenuBg } from '../../assets';
import { useAuth } from '../../hooks/useAuth';
import { useLeague } from '../../hooks/useLeague';
import { subscribeToLeaderboard, type UserWithId } from '../../services';
import { getPositionCompact } from '../../utils';
import { Button, ProfilePicture } from '../ui';

const menuItemClass =
  'w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 rounded-lg text-sm';

const dividerClass = 'border-t border-white/10 my-1';

type UserMenuProps = {
  mobile?: boolean;
};

export const UserMenu = ({ mobile = false }: UserMenuProps) => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { selectedLeague, leagueMemberIds } = useLeague();
  const [isOpen, setIsOpen] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const [dropdownRect, setDropdownRect] = React.useState<DOMRect | null>(null);
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const justSignedIn = React.useRef(false);

  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  const position = React.useMemo(() => {
    if (!user) return null;

    if (selectedLeague && leagueMemberIds.length > 0) {
      const leagueUsers = allUsers.filter((u) =>
        leagueMemberIds.includes(u.id)
      );
      const idx = leagueUsers.findIndex((u) => u.id === user.uid);
      if (idx === -1) return null;
      return idx + 1;
    }

    const idx = allUsers.findIndex((u) => u.id === user.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [user, allUsers, selectedLeague, leagueMemberIds]);

  const currentLeaderboardUser = React.useMemo(() => {
    if (!user) return null;
    return allUsers.find((u) => u.id === user.uid) ?? null;
  }, [user, allUsers]);

  React.useEffect(() => {
    if (justSignedIn.current && userData?.userName) {
      justSignedIn.current = false;
      void navigate(`/${userData.userName}`);
    }
  }, [userData, navigate]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        void navigate('/');
      })
      .catch(console.error);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideButton =
        buttonRef.current && !buttonRef.current.contains(target);
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);

      if (clickedOutsideButton && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!isOpen || mobile) return;

    let frameId: number | null = null;
    const updateDropdownPosition = () => {
      if (frameId !== null) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        if (buttonRef.current) {
          setDropdownRect(buttonRef.current.getBoundingClientRect());
        }
      });
    };

    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [isOpen, mobile]);

  const closeMenu = () => setIsOpen(false);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      setDropdownRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen((open) => !open);
  };

  const handleSignIn = () => {
    setAuthError(null);
    justSignedIn.current = true;
    signInWithDomainCheck().catch((error) => {
      justSignedIn.current = false;
      if (error instanceof UnauthorizedDomainError) {
        setAuthError(error.message);
      } else {
        console.error(error);
      }
    });
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Button onClick={handleSignIn} className={mobile ? 'text-xs' : 'w-full'}>
          {mobile ? 'Ingresar' : 'Ingresar con Google'}
        </Button>
        {authError && (
          <div className="flex items-center gap-2 bg-red-600/90 border border-red-400 rounded-lg px-3 py-2 mt-1 w-full">
            <span className="text-white text-base leading-none">!</span>
            <p className="text-white text-xs font-semibold">{authError}</p>
          </div>
        )}
      </div>
    );
  }

  const menuContent = (
    <>
      {!mobile && (
        <>
          <li>
            <Link to="/" onClick={closeMenu} className={menuItemClass}>
              <span>📅</span> Partidos
            </Link>
          </li>
          <li>
            <Link
              to={`/${userData?.userName}`}
              onClick={closeMenu}
              className={menuItemClass}
            >
              <span>⚽</span> Mis pronosticos
            </Link>
          </li>
          <li>
            <Link
              to="/leaderboard"
              onClick={closeMenu}
              className={menuItemClass}
            >
              <span>🥇</span> Podio
            </Link>
          </li>
          <li>
            <Link
              to="/standings"
              onClick={closeMenu}
              className={menuItemClass}
            >
              <span>#</span> Tabla de posiciones
            </Link>
          </li>
        </>
      )}
      <li>
        <Link
          to="/edit-profile"
          onClick={closeMenu}
          className={menuItemClass}
        >
          <span>✏️</span> Editar perfil
        </Link>
      </li>
      <li className={dividerClass} />
      {mobile && (
        <>
          <li>
            <Link to="/rules" onClick={closeMenu} className={menuItemClass}>
              <span>📋</span> Reglas
            </Link>
          </li>
          <li className={dividerClass} />
        </>
      )}
      <li>
        <button
          onClick={() => {
            handleSignOut();
            closeMenu();
          }}
          className={menuItemClass}
        >
          <span>👋</span> Cerrar sesion
        </button>
      </li>
    </>
  );

  return (
    <div ref={buttonRef} className="relative">
      <div
        className={`flex items-center ${
          mobile
            ? ''
            : `w-full gap-3 justify-start px-3! p-2! border border-white/10 bg-black/20 backdrop-blur-sm ${
                isOpen ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'
              }`
        }`}
        style={
          mobile
            ? undefined
            : {
                background:
                  'linear-gradient(180deg, rgba(0, 43, 55, 0.5), rgba(0, 87, 74, 0.28))',
                borderColor: 'rgba(0, 217, 121, 0.2)',
              }
        }
      >
        {!mobile && userData && (
          <>
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="md"
              className="border-0 rounded-lg"
            />
            <div className="relative aspect-square h-16 flex flex-col items-center justify-center rounded-lg overflow-hidden">
              <div
                className="absolute inset-0 scale-[-1] opacity-70"
                style={{
                  backgroundImage: `url(${sidebarMenuBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <span className="relative text-white/60 text-[10px] uppercase tracking-wider">
                Puntos
              </span>
              <span className="relative text-white font-semibold text-xl">
                {currentLeaderboardUser?.score ?? userData.score}
              </span>
            </div>
            {position !== null && (
              <Link
                to="/leaderboard"
                className="relative aspect-square h-16 flex flex-col items-center justify-center rounded-lg overflow-hidden transition-opacity hover:opacity-85"
                aria-label="Ir al podio"
              >
                <div
                  className="absolute inset-0 scale-[-1] opacity-70"
                  style={{
                    backgroundImage: `url(${sidebarMenuBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <span className="relative text-white/60 text-[10px] uppercase tracking-wider">
                  Posicion
                </span>
                <span className="relative text-white font-semibold text-xl">
                  {getPositionCompact(position)}
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={toggleMenu}
              className={`ml-auto px-2 text-white/50 transition-transform hover:cursor-pointer hover:text-white/80 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-label={isOpen ? 'Cerrar menu' : 'Abrir menu'}
            >
              ▼
            </button>
          </>
        )}
        {mobile && userData && (
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-10 w-12 flex-col items-center justify-center gap-1.5 rounded-md transition-opacity hover:cursor-pointer hover:opacity-85"
            aria-label={isOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            <span className="h-0.5 w-8 rounded-full bg-white/85" />
            <span className="h-0.5 w-8 rounded-full bg-white/85" />
            <span className="h-0.5 w-8 rounded-full bg-white/85" />
          </button>
        )}
      </div>
      {isOpen &&
        (mobile
          ? createPortal(
              <ul
                ref={dropdownRef}
                className="p-2 fixed left-0 right-0 bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-xl z-50"
                style={{ top: 'calc(env(safe-area-inset-top) + 76px)' }}
              >
                {menuContent}
              </ul>,
              document.body
            )
          : dropdownRect
            ? createPortal(
                <ul
                  ref={dropdownRef}
                  className="p-2 fixed z-100 backdrop-blur-2xl bg-black/90 border border-white/10 border-t-0 rounded-b-xl shadow-xl"
                  style={{
                    top: dropdownRect.bottom,
                    left: dropdownRect.left,
                    width: dropdownRect.width,
                  }}
                >
                  {menuContent}
                </ul>,
                document.body
              )
            : null)}
    </div>
  );
};
