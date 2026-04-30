import type { Match, UserPredictions, UserWithId } from '../services';
import {
  calculatePredictionPoints,
  isCorrectResult,
} from './scoring';

export type StandingMatchDetail = {
  matchId: string;
  label: string;
  realScore: string;
  predictionScore: string;
  points: number;
  status: 'exact' | 'correct' | 'wrong' | 'pending';
};

export type StandingRow = UserWithId & {
  position: number;
  exactCount: number;
  resultCount: number;
  playedPredictions: number;
  details: StandingMatchDetail[];
};

const getMatchLabel = (match: Match): string =>
  `${match.homeName} vs ${match.awayName}`;

export const buildStandingRows = (
  users: UserWithId[],
  matches: Record<string, Match>,
  predictionsByUser: Record<string, UserPredictions>
): StandingRow[] => {
  const rows = users.map((user) => {
    const userPredictions = predictionsByUser[user.id] ?? {};
    let exactCount = 0;
    let resultCount = 0;
    let playedPredictions = 0;
    let baseScore = 0;

    const details = Object.entries(matches)
      .filter(([, match]) => match.homeScore >= 0 && match.awayScore >= 0)
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .flatMap(([matchId, match]) => {
        const prediction = userPredictions[matchId];
        if (!prediction) return [];

        playedPredictions++;

        const points = calculatePredictionPoints(
          match.homeScore,
          match.awayScore,
          prediction.homePrediction,
          prediction.awayPrediction
        );
        const exact =
          match.homeScore === prediction.homePrediction &&
          match.awayScore === prediction.awayPrediction;
        const correct = isCorrectResult(
          match.homeScore,
          match.awayScore,
          prediction.homePrediction,
          prediction.awayPrediction
        );

        if (exact) {
          exactCount++;
        } else if (correct) {
          resultCount++;
        }

        baseScore += points;

        return [
          {
            matchId,
            label: getMatchLabel(match),
            realScore: `${match.homeScore} - ${match.awayScore}`,
            predictionScore: `${prediction.homePrediction} - ${prediction.awayPrediction}`,
            points,
            status: exact
              ? 'exact'
              : correct
                ? 'correct'
                : 'wrong',
          } satisfies StandingMatchDetail,
        ];
      });

    return {
      ...user,
      score: baseScore,
      position: 0,
      exactCount,
      resultCount,
      playedPredictions,
      details,
    };
  });

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount;
    if (b.resultCount !== a.resultCount) return b.resultCount - a.resultCount;
    return a.displayName.localeCompare(b.displayName);
  });

  return rows.map((row, index) => ({ ...row, position: index + 1 }));
};
