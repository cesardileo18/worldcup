const getWinner = (home: number, away: number): 'home' | 'away' | 'tied' => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
};

type MatchLike = {
  homeScore: number;
  awayScore: number;
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

  const realWinner = getWinner(homeScore, awayScore);
  const predictedWinner = getWinner(homePrediction, awayPrediction);

  if (realWinner !== predictedWinner) {
    return 0;
  }

  if (homeScore === homePrediction && awayScore === awayPrediction) {
    return 10;
  }

  if (realWinner === 'tied') {
    return 6;
  }

  if (homeScore === homePrediction || awayScore === awayPrediction) {
    return 8;
  }

  return 6;
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

export const calculateTotalScore = (
  matches: Record<string, MatchLike>,
  predictions: Record<string, PredictionLike> | undefined
): number => {
  if (!predictions) {
    return 0;
  }

  return Object.entries(predictions).reduce((total, [matchId, prediction]) => {
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
  }, 0);
};
