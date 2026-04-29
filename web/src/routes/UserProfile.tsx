import React from 'react';
import { useParams } from 'react-router-dom';
import {
  AppLayout,
  MatchesByDay,
  MatchesByGroup,
  MatchesHeader,
  UserHeader,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import {
  type UserPredictions,
  subscribeToPredictions,
  getUserByUsername,
} from '../services';

type ViewMode = 'day' | 'group';

export const UserProfile = () => {
  const { userName } = useParams();
  const { matches, loading: matchesLoading, error } = useMatches();
  const { user } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [profileUserId, setProfileUserId] = React.useState<string | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [profileError, setProfileError] = React.useState<string | null>(null);

  const isOwnProfile = !!user && profileUserId === user.uid;

  // Reset state when userName changes to prevent stale data flash
  React.useEffect(() => {
    setProfileLoading(true);
    setProfileUserId(null);
    setPredictions({});
    setProfileError(null);
  }, [userName]);

  // Get the user ID for the profile being viewed
  React.useEffect(() => {
    let cancelled = false;

    setProfileLoading(true);
    setProfileUserId(null);
    setPredictions({});
    setProfileError(null);

    if (!userName) {
      setProfileLoading(false);
      return () => {
        cancelled = true;
      };
    }

    getUserByUsername(userName)
      .then((profileUser) => {
        if (cancelled) return;

        if (!profileUser) {
          setProfileError('Usuario no encontrado');
          setProfileUserId(null);
          return;
        }

        setProfileUserId(profileUser.id);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error(err);
        setProfileError('No se pudo cargar el usuario');
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userName]);

  // Subscribe to predictions for the profile being viewed
  React.useEffect(() => {
    if (!profileUserId) return;

    const unsubscribe = subscribeToPredictions(profileUserId, (nextPredictions) => {
      setPredictions(nextPredictions);
    });
    return () => unsubscribe();
  }, [profileUserId]);

  const loading = profileLoading || matchesLoading;

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        {loading ? (
          <div className="text-center text-white/70 py-20">Cargando...</div>
        ) : (
          <>
            {profileUserId && (
              <UserHeader
                key={profileUserId}
                userId={profileUserId}
                className="mb-8 border-b border-white/10 pb-8"
              />
            )}

            <MatchesHeader viewMode={viewMode} onViewModeChange={setViewMode} />

            {error && (
              <div className="text-center text-red-400">Error: {error}</div>
            )}

            {profileError && (
              <div className="text-center text-red-400 mb-4">
                {profileError}
              </div>
            )}

            {matches &&
              (viewMode === 'day' ? (
                <MatchesByDay
                  key={profileUserId ?? userName}
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={profileUserId ?? undefined}
                  predictions={predictions}
                />
              ) : (
                <MatchesByGroup
                  key={profileUserId ?? userName}
                  matches={matches}
                  isOwnProfile={isOwnProfile}
                  userId={profileUserId ?? undefined}
                  predictions={predictions}
                />
              ))}

            {profileUserId && Object.keys(predictions).length === 0 && (
              <div className="text-center text-white/50 mt-6">
                Este usuario todavia no cargo predicciones.
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
