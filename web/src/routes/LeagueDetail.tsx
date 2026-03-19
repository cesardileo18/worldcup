import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  AppLayout,
  Card,
  Button,
  LinkButton,
  LeaderboardList,
  LeaguePicture,
  useConfirm,
} from '../components';
import { useAuth, useLeague, useToast } from '../hooks';
import {
  getLeagueBySlug,
  isLeagueMember,
  leaveLeague,
  regenerateInviteCode,
  subscribeToLeaderboard,
  subscribeToLeagueMembers,
  type LeagueWithId,
  type UserWithId,
} from '../services';

export const LeagueDetail = () => {
  const { slug } = useParams();
  const { user, userData } = useAuth();
  const { setSelectedLeague } = useLeague();
  const navigate = useNavigate();
  const { showConfirm, ConfirmDialogComponent } = useConfirm();
  const { showToast } = useToast();
  const [league, setLeague] = React.useState<LeagueWithId | null>(null);
  const [members, setMembers] = React.useState<UserWithId[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isMember, setIsMember] = React.useState(false);
  const [showInviteCode, setShowInviteCode] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  const [accessChecked, setAccessChecked] = React.useState(false);

  const isOwner = user && league?.ownerId === user.uid;
  const isAdmin = userData?.admin === true;
  const canManageMembers = isOwner || isAdmin;

  // Load league data
  React.useEffect(() => {
    if (!slug) return;

    const loadLeague = async () => {
      setLoading(true);
      setAccessChecked(false);
      const leagueData = await getLeagueBySlug(slug);
      setLeague(leagueData);

      if (leagueData && user) {
        const memberStatus = await isLeagueMember(leagueData.id, user.uid);
        setIsMember(memberStatus);
        setAccessChecked(true);
      } else if (leagueData && !user) {
        // Not logged in - mark as checked (will redirect)
        setAccessChecked(true);
      } else {
        // Liga no encontrada - mark as checked
        setAccessChecked(true);
      }

      setLoading(false);
    };

    void loadLeague();
  }, [slug, user]);

  // Redirect non-members to /leagues
  React.useEffect(() => {
    if (loading || !accessChecked) return;

    // Liga no encontrada is handled by the render below
    if (!league) return;

    // Not logged in or not a member - redirect
    if (!user || !isMember) {
      void navigate('/leagues', { replace: true });
    }
  }, [loading, accessChecked, league, user, isMember, navigate]);

  // Subscribe to league members and leaderboard (real-time updates)
  React.useEffect(() => {
    if (!league) return;

    let memberIds: string[] = [];
    let allUsers: UserWithId[] = [];

    const updateMembers = () => {
      const leagueMembers = allUsers.filter((u) => memberIds.includes(u.id));
      setMembers(leagueMembers);
      // Update isMember status reactively
      if (user) {
        setIsMember(memberIds.includes(user.uid));
      }
    };

    // Subscribe to league members
    const unsubscribeMembers = subscribeToLeagueMembers(league.id, (ids) => {
      memberIds = ids;
      updateMembers();
    });

    // Subscribe to leaderboard
    const unsubscribeLeaderboard = subscribeToLeaderboard((users) => {
      allUsers = users;
      updateMembers();
    });

    return () => {
      unsubscribeMembers();
      unsubscribeLeaderboard();
    };
  }, [league, user]);

  const handleLeave = async () => {
    if (!league || !user || isOwner) return;

    const confirmed = await showConfirm({
      title: 'Salir de la liga',
      message: '¿Seguro que quieres salir de esta liga?',
      confirmText: 'Salir',
    });

    if (!confirmed) return;

    setLeaving(true);
    try {
      await leaveLeague(league.id, user.uid);
      setSelectedLeague(null);
      window.location.href = '/leagues';
    } catch (err) {
      console.error(err);
      setLeaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!league || !isOwner) return;

    const confirmed = await showConfirm({
      title: 'Regenerar código de invitación',
      message:
        'Esto invalidará el código anterior. Quien tenga el enlace viejo ya no podrá unirse.',
      confirmText: 'Regenerar',
    });

    if (!confirmed) return;

    try {
      const newCode = await regenerateInviteCode(league.id);
      setLeague({ ...league, inviteCode: newCode });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId: string, displayName: string) => {
    if (!league || !canManageMembers) return;

    // Don't allow removing the owner
    if (userId === league.ownerId) {
      showToast("No puedes quitar al dueño de la liga", 'error');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Quitar miembro',
      message: `¿Seguro que quieres quitar a ${displayName} de esta liga?`,
      confirmText: 'Quitar',
    });

    if (!confirmed) return;

    try {
      await leaveLeague(league.id, userId);
      showToast(`${displayName} fue quitado de la liga`);
    } catch (err) {
      console.error(err);
      showToast('No se pudo quitar al miembro', 'error');
    }
  };

  const getShareableLink = () => {
    if (!league) return '';
    return `${window.location.origin}/league/${league.slug}/join/${league.inviteCode}`;
  };

  const copyShareableLink = () => {
    void navigator.clipboard.writeText(getShareableLink());
    showToast('Enlace copiado al portapapeles');
  };

  if (loading || !accessChecked) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
          <div className="text-center text-white/70 py-20">Cargando...</div>
        </div>
      </AppLayout>
    );
  }

  // Don't render if redirecting (not logged in or not a member)
  if (!user || !isMember) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
          <div className="text-center text-white/70 py-20">Redirigiendo...</div>
        </div>
      </AppLayout>
    );
  }

  if (!league) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Liga no encontrada
            </h1>
            <Link to="/leagues" className="text-white/70 hover:text-white">
              ← Volver a mis ligas
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {ConfirmDialogComponent}
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              to="/leagues"
              className="text-white/50 hover:text-white text-sm"
            >
              ← Mis ligas
            </Link>
            {isMember && !isOwner && (
              <Button
                onClick={() => void handleLeave()}
                disabled={leaving}
                className="text-xs"
              >
                {leaving ? 'Saliendo...' : 'Salir'}
              </Button>
            )}
            {isOwner && (
              <LinkButton
                to={`/league/${league.slug}/edit`}
                className="text-xs"
              >
                Editar
              </LinkButton>
            )}
          </div>

          <div className="flex items-start gap-4 mt-2">
            <LeaguePicture src={league.imageURL} name={league.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">{league.name}</h1>
              </div>
              {league.description && (
                <p className="text-white/70 mt-2">{league.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invite Section (owner only) */}
        {isOwner && (
          <Card className="p-4 mb-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Invitar amigos</h3>
                <p className="text-white/50 text-sm">
                  Comparte este enlace para invitar a otros
                </p>
              </div>
              <Button
                onClick={() => setShowInviteCode(!showInviteCode)}
                className={`text-xs ${showInviteCode ? 'border-0' : ''}`}
              >
                {showInviteCode ? '✕' : 'Mostrar enlace'}
              </Button>
            </div>
            {showInviteCode && (
              <div className="mt-4 space-y-4">
                {/* Link and Copy */}
                <div className="space-y-2">
                  <div className="overflow-hidden bg-white/10 px-4 py-3 rounded-lg">
                    <code className="text-sm font-mono text-white/70 block truncate">
                      {getShareableLink()}
                    </code>
                  </div>
                  <Button
                    onClick={copyShareableLink}
                    className="text-sm w-full"
                  >
                    Copiar enlace
                  </Button>
                </div>
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3 pt-3 border-t border-white/10">
                  <p className="text-white/50 text-sm">Escanea para unirte</p>
                  <div
                    className="bg-white p-3 rounded-xl"
                    id="qr-code-container"
                  >
                    <QRCodeCanvas
                      value={getShareableLink()}
                      size={160}
                      bgColor="white"
                      fgColor="black"
                      level="M"
                      id="qr-code"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const canvas = document.getElementById(
                        'qr-code'
                      ) as HTMLCanvasElement;
                      if (canvas) {
                        const link = document.createElement('a');
                        link.download = `${league.slug}-invite-qr.png`;
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                      }
                    }}
                    className="text-sm"
                  >
                    Descargar QR
                  </Button>
                </div>
                {/* Invite Code */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white/50 text-sm">
                    Código:{' '}
                    <span className="font-mono text-white">
                      {league.inviteCode}
                    </span>
                  </span>
                  {isOwner && (
                    <Button
                      onClick={() => void handleRegenerateCode()}
                      className="text-sm"
                    >
                      Regenerar
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Leaderboard */}
        {members.length > 0 && (
          <div className="mt-10">
            <LeaderboardList
              variant="full"
              users={members}
              onRemoveMember={
                canManageMembers
                  ? (userId, displayName) =>
                      void handleRemoveMember(userId, displayName)
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};
