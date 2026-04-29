import { createContext } from 'react';
import { type MatchesData } from '../services/matchService';

export interface MatchContextType {
  matches: MatchesData | null;
  loading: boolean;
  error: string | null;
  revealMockResults: () => void;
  resetMockResults: () => void;
  mockResultsVisible: boolean;
}

export const MatchContext = createContext<MatchContextType>({
  matches: null,
  loading: true,
  error: null,
  revealMockResults: () => undefined,
  resetMockResults: () => undefined,
  mockResultsVisible: false,
});
