const getWinner = (home: number, away: number): 'home' | 'away' | 'tied' => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
};

type MatchLike = {
  homeScore: number;
  awayScore: number;
  timestamp: number;
};

type PredictionLike = {
  homePrediction: number | null;
  awayPrediction: number | null;
};

export const calculatePredictionPoints = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null
): number => {
  if (
    homeScore < 0 ||
    awayScore < 0 ||
    homePrediction === null ||
    awayPrediction === null
  ) {
    return 0;
  }

  if (homeScore === homePrediction && awayScore === awayPrediction) {
    return 15;
  }

  if (getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction)) {
    const difference =
      Math.abs(homePrediction - homeScore) + Math.abs(awayPrediction - awayScore);
    return Math.max(1, 10 - difference);
  }

  return 0;
};

export const isCorrectResult = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null
): boolean => {
  if (
    homeScore < 0 ||
    awayScore < 0 ||
    homePrediction === null ||
    awayPrediction === null
  ) {
    return false;
  }

  return getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction);
};

// Rule added 2026-04-13: streak bonus for testing.
// Adds 2 extra points each time a user gets two played matches right in a row.
// A streak of 3 correct results gives +4 total bonus: match 1+2, then match 2+3.
export const calculateStreakBonus = (
  matches: Record<string, MatchLike>,
  predictions: Record<string, PredictionLike> | undefined
): number => {
  if (!predictions) {
    return 0;
  }

  const playedMatches = Object.entries(matches)
    .filter(([, match]) => match.homeScore >= 0 && match.awayScore >= 0)
    .sort(([, a], [, b]) => a.timestamp - b.timestamp);

  let bonus = 0;
  let previousWasCorrect = false;

  for (const [matchId, match] of playedMatches) {
    const prediction = predictions[matchId];
    const currentIsCorrect =
      !!prediction &&
      isCorrectResult(
        match.homeScore,
        match.awayScore,
        prediction.homePrediction,
        prediction.awayPrediction
      );

    if (previousWasCorrect && currentIsCorrect) {
      bonus += 2;
    }

    previousWasCorrect = currentIsCorrect;
  }

  return bonus;
};

export const calculateTotalScoreWithStreakBonus = (
  matches: Record<string, MatchLike>,
  predictions: Record<string, PredictionLike> | undefined
): number => {
  if (!predictions) {
    return 0;
  }

  const baseScore = Object.entries(predictions).reduce(
    (total, [matchId, prediction]) => {
      const match = matches[matchId];
      if (!match) return total;

      return (
        total +
        calculatePredictionPoints(
          match.homeScore,
          match.awayScore,
          prediction.homePrediction,
          prediction.awayPrediction
        )
      );
    },
    0
  );

  return baseScore + calculateStreakBonus(matches, predictions);
};
