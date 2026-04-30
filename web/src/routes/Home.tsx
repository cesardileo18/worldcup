import React from 'react';
import {
  AppLayout,
  MatchesByDay,
  MatchesByGroup,
  MatchesHeader,
} from '../components';
import { useAuth, useMatches } from '../hooks';
import {
  subscribeToPredictions,
  type UserPredictions,
} from '../services';
import { isMockModeEnabled } from '../utils';

type ViewMode = 'day' | 'group';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const { user } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const mockMode = isMockModeEnabled();

  // Hide splash once data is loaded
  React.useEffect(() => {
    if (!loading && (matches || error)) {
      window.hideSplash?.();
    }
  }, [loading, matches, error]);

  React.useEffect(() => {
    if (!mockMode || !user) {
      setPredictions({});
      return;
    }

    const unsubscribe = subscribeToPredictions(user.uid, setPredictions);
    return () => unsubscribe();
  }, [mockMode, user]);

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        <MatchesHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showMobileMascot
        />

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">Cargando partidos...</div>
        )}

        {error && (
          <div className="text-center text-red-400">Error: {error}</div>
        )}

        {matches &&
          (viewMode === 'day' ? (
            <MatchesByDay
              matches={matches}
              isOwnProfile={mockMode && !!user}
              userId={user?.uid}
              predictions={predictions}
            />
          ) : (
            <MatchesByGroup
              matches={matches}
              isOwnProfile={mockMode && !!user}
              userId={user?.uid}
              predictions={predictions}
            />
          ))}
      </div>
    </AppLayout>
  );
};
