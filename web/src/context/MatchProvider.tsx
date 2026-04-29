import React from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import {
  areMockResultsVisible,
  getMockMatchesForCurrentState,
  hideMockResults,
  mockResultsEvent,
  revealMockResults,
} from '../mock/mockModeState';
import { fetchMatches, type MatchesData } from '../services/matchService';
import { isMockModeEnabled } from '../utils';
import { MatchContext } from './MatchContext';

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [matches, setMatches] = React.useState<MatchesData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mockResultsVisible, setMockResultsVisible] = React.useState(() =>
    isMockModeEnabled() && areMockResultsVisible()
  );
  const fetchAttemptedRef = React.useRef(false);

  React.useEffect(() => {
    if (isMockModeEnabled()) {
      const syncMockMatches = () => {
        setMatches(getMockMatchesForCurrentState());
        setMockResultsVisible(areMockResultsVisible());
        setLoading(false);
        setError(null);
      };

      syncMockMatches();
      window.addEventListener(mockResultsEvent, syncMockMatches);
      return () => window.removeEventListener(mockResultsEvent, syncMockMatches);
    }

    const matchesRef = ref(db, 'matches');

    const unsubscribe = onValue(
      matchesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMatches(snapshot.val() as MatchesData);
          setLoading(false);
        } else if (!fetchAttemptedRef.current) {
          fetchAttemptedRef.current = true;
          fetchMatches()
            .then((data) => {
              setMatches(data);
            })
            .catch((err: unknown) => {
              console.error('Error fetching matches:', err);
              setError(
                err instanceof Error ? err.message : 'Failed to load matches'
              );
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to matches:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    matches,
    loading,
    error,
    revealMockResults,
    resetMockResults: hideMockResults,
    mockResultsVisible,
  };

  return <MatchContext value={value}>{children}</MatchContext>;
};
