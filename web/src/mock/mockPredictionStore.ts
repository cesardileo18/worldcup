import { calculateTotalScore } from '../utils/scoring';
import { mockMatches } from './mockMatches';
import { areMockResultsVisible } from './mockModeState';

type MockPrediction = {
  homePrediction: number;
  awayPrediction: number;
};

export type MockPredictionsByUser = Record<
  string,
  Record<string, MockPrediction>
>;

export const mockPredictionsPath = 'mockPredictions';

export const calculateMockUserScore = (
  predictions: Record<string, MockPrediction> | undefined
): number => {
  if (!areMockResultsVisible() || !predictions) {
    return 0;
  }

  return calculateTotalScore(mockMatches, predictions);
};
