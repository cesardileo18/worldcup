import { mockMatches } from './mockMatches';
import type { MatchesData } from '../services/matchService';

export const mockResultsEvent = 'mock-results-updated';

const MOCK_RESULTS_KEY = 'worldcup-2026:mock-results-visible';

export const areMockResultsVisible = (): boolean =>
  localStorage.getItem(MOCK_RESULTS_KEY) === 'true';

export const revealMockResults = (): void => {
  localStorage.setItem(MOCK_RESULTS_KEY, 'true');
  window.dispatchEvent(new Event(mockResultsEvent));
};

export const hideMockResults = (): void => {
  localStorage.removeItem(MOCK_RESULTS_KEY);
  window.dispatchEvent(new Event(mockResultsEvent));
};

export const getMockMatchesForCurrentState = (): MatchesData => {
  if (areMockResultsVisible()) {
    return mockMatches;
  }

  return Object.fromEntries(
    Object.entries(mockMatches).map(([matchId, match]) => [
      matchId,
      {
        ...match,
        homeScore: -1,
        awayScore: -1,
      },
    ])
  );
};
