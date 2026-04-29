import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onValueWritten } from 'firebase-functions/v2/database';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// FIFA API constants for World Cup 2026
const FIFA_COMPETITION_ID = '17'; // FIFA World Cup
const FIFA_SEASON_ID = '285023'; // 2026

interface Match {
  game: string;
  fifaId: string;
  homeScore: number;
  awayScore: number;
  timestamp: number;
}

interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
}

interface FifaMatch {
  IdMatch: string;
  Home: { Score: number | null; Abbreviation: string | null; ShortClubName: string | null };
  Away: { Score: number | null; Abbreviation: string | null; ShortClubName: string | null };
  StageName: Array<{ Description: string }>;
  GroupName: Array<{ Description: string }> | null;
  Date: string;
  Stadium: {
    Name: Array<{ Description: string }>;
    CityName: Array<{ Description: string }>;
    IdCountry: string;
  };
  PlaceHolderA: string;
  PlaceHolderB: string;
}

interface FifaApiResponse {
  Results: FifaMatch[];
}

/**
 * Determine the winner of a match
 */
const getWinner = (home: number, away: number): 'home' | 'away' | 'tied' => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
};

/**
 * Calculate points for a prediction
 * - 15 points: Exact score
 * - Up to 10 points: Correct winner, minus difference from actual score (min 1)
 * - 0 points: Wrong winner or no prediction
 */
const calculatePoints = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null
): number => {
  // No prediction or match not played yet
  if (homeScore < 0 || homePrediction === null || awayPrediction === null) {
    return 0;
  }

  // Exact score: 15 points
  if (homeScore === homePrediction && awayScore === awayPrediction) {
    return 15;
  }

  // Correct winner: 10 points minus difference (min 1)
  if (getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction)) {
    const difference = Math.abs(homePrediction - homeScore) + Math.abs(awayPrediction - awayScore);
    return Math.max(1, 10 - difference);
  }

  // Wrong winner: 0 points
  return 0;
};

const isCorrectResult = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null
): boolean => {
  if (homeScore < 0 || awayScore < 0 || homePrediction === null || awayPrediction === null) {
    return false;
  }

  return getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction);
};

// Rule added 2026-04-13: streak bonus for testing.
// Adds 2 extra points each time a user gets two played matches right in a row.
// A streak of 3 correct results gives +4 total bonus: match 1+2, then match 2+3.
const calculateStreakBonus = (
  matches: Record<string, Match>,
  userPredictions: Record<string, Prediction>
): number => {
  const playedMatches = Object.entries(matches)
    .filter(([, match]) => match.homeScore >= 0 && match.awayScore >= 0)
    .sort(([, a], [, b]) => a.timestamp - b.timestamp);

  let bonus = 0;
  let previousWasCorrect = false;

  for (const [matchId, match] of playedMatches) {
    const prediction = userPredictions[matchId];
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

const calculateUserScore = (
  matches: Record<string, Match>,
  userPredictions: Record<string, Prediction> | null
): number => {
  if (!userPredictions) {
    return 0;
  }

  const baseScore = Object.values(userPredictions).reduce(
    (total, prediction) => total + (prediction.points ?? 0),
    0
  );

  return baseScore + calculateStreakBonus(matches, userPredictions);
};

/**
 * Scheduled function to fetch and update match scores from FIFA API
 * Runs every 1 minute during the tournament
 */
export const updateMatchScores = onSchedule('every 1 minutes', async () => {
  logger.info('Updating match scores from FIFA API...');

  try {
    // Get today's date range
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const fromDate = startOfDay.toISOString();
    const toDate = endOfDay.toISOString();

    // Fetch today's matches from FIFA API
    const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&from=${fromDate}&to=${toDate}&count=500`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`FIFA API error: ${response.status}`);
    }

    const data = await response.json() as FifaApiResponse;

    // Get current matches from database
    const matchesSnapshot = await db.ref('matches').once('value');
    const matches = matchesSnapshot.val() as Record<string, Match> | null;

    if (!matches) {
      logger.warn('No matches found in database');
      return;
    }

    // Update scores — gameId IS the FIFA IdMatch, so direct lookup O(n)
    const updates: Record<string, number> = {};

    for (const fifaMatch of data.Results) {
      const match = matches[fifaMatch.IdMatch];
      if (match) {
        const homeScore = fifaMatch.Home?.Score ?? -1;
        const awayScore = fifaMatch.Away?.Score ?? -1;

        if (match.homeScore !== homeScore && homeScore >= 0) {
          updates[`matches/${fifaMatch.IdMatch}/homeScore`] = homeScore;
          logger.info(`Updated game ${fifaMatch.IdMatch} home score: ${homeScore}`);
        }

        if (match.awayScore !== awayScore && awayScore >= 0) {
          updates[`matches/${fifaMatch.IdMatch}/awayScore`] = awayScore;
          logger.info(`Updated game ${fifaMatch.IdMatch} away score: ${awayScore}`);
        }
      }
    }

    // Apply all updates at once
    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      logger.info(`Applied ${Object.keys(updates).length} score updates`);
    }
  } catch (error) {
    logger.error('Error updating match scores:', error);
  }
});

/**
 * Triggered when a match is updated
 * Recalculates prediction points for all users for that match
 */
export const updatePredictionPoints = onValueWritten(
  'matches/{matchId}',
  async (event) => {
    const matchId = event.params.matchId;
    const match = event.data.after.val() as Match | null;

    if (!match) {
      logger.warn(`Match ${matchId} was deleted`);
      return;
    }

    // Only recalculate if match has scores
    if (match.homeScore < 0 || match.awayScore < 0) {
      return;
    }

    logger.info(`Updating prediction points for match ${matchId}`);

    try {
      // Fetch all predictions in a single read
      const predictionsSnapshot = await db.ref('predictions').once('value');
      const allPredictions = predictionsSnapshot.val() as Record<string, Record<string, Prediction>> | null;

      if (!allPredictions) return;

      const updates: Record<string, number> = {};

      // Calculate points for each user's prediction
      for (const [userId, userPredictions] of Object.entries(allPredictions)) {
        const prediction = userPredictions[matchId];
        if (prediction) {
          const points = calculatePoints(
            match.homeScore,
            match.awayScore,
            prediction.homePrediction,
            prediction.awayPrediction
          );

          if (prediction.points !== points) {
            updates[`predictions/${userId}/${matchId}/points`] = points;
            logger.info(`User ${userId}: ${points} points for match ${matchId}`);
          }
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        logger.info(`Updated ${Object.keys(updates).length} prediction points`);
      }
    } catch (error) {
      logger.error('Error updating prediction points:', error);
    }
  }
);

/**
 * Triggered when prediction points change
 * Updates the user's total score
 */
export const updateUserScore = onValueWritten(
  'predictions/{userId}/{matchId}/points',
  async (event) => {
    const { userId } = event.params;
    const beforePoints = event.data.before.val() as number | null ?? 0;
    const afterPoints = event.data.after.val() as number | null ?? 0;

    // No change in points
    if (beforePoints === afterPoints) {
      return;
    }

    logger.info(`User ${userId} points changed: ${beforePoints} -> ${afterPoints}`);

    try {
      const [matchesSnapshot, predictionsSnapshot] = await Promise.all([
        db.ref('matches').once('value'),
        db.ref(`predictions/${userId}`).once('value'),
      ]);

      const matches = matchesSnapshot.val() as Record<string, Match> | null;
      const userPredictions = predictionsSnapshot.val() as Record<string, Prediction> | null;

      if (!matches) {
        logger.warn('No matches found while updating user score');
        return;
      }

      const score = calculateUserScore(matches, userPredictions);
      await db.ref(`users/${userId}/score`).set(score);
      logger.info(`User ${userId} score recalculated: ${score}`);
    } catch (error) {
      logger.error('Error updating user score:', error);
    }
  }
);

/**
 * Scheduled function to refresh all match data from FIFA API once per day.
 * Updates team names, groups, stadiums and any other match metadata
 * that may change as teams qualify (e.g. knockout stage placeholders).
 * Runs every day at 06:00 UTC.
 */
export const refreshMatchData = onSchedule('0 6 * * *', async () => {
  logger.info('Refreshing full match data from FIFA API...');

  try {
    const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&count=500`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`FIFA API error: ${response.status}`);
    }

    const data = await response.json() as FifaApiResponse;
    const updates: Record<string, unknown> = {};

    for (const item of data.Results) {
      const gameId = item.IdMatch;
      const home = item.Home?.Abbreviation ?? item.PlaceHolderA;
      const homeName = item.Home?.ShortClubName ?? item.PlaceHolderA;
      const away = item.Away?.Abbreviation ?? item.PlaceHolderB;
      const awayName = item.Away?.ShortClubName ?? item.PlaceHolderB;
      const round = item.StageName?.[0]?.Description ?? '';
      const group = item.GroupName?.[0]?.Description?.replace('Group ', '') ?? null;
      const location = item.Stadium?.Name?.[0]?.Description ?? '';
      const locationCity = item.Stadium?.CityName?.[0]?.Description ?? '';
      const locationCountry = item.Stadium?.IdCountry ?? '';
      const timestamp = Math.floor(new Date(item.Date).getTime() / 1000);

      updates[`matches/${gameId}/home`] = home;
      updates[`matches/${gameId}/homeName`] = homeName;
      updates[`matches/${gameId}/away`] = away;
      updates[`matches/${gameId}/awayName`] = awayName;
      updates[`matches/${gameId}/round`] = round;
      updates[`matches/${gameId}/group`] = group;
      updates[`matches/${gameId}/location`] = location;
      updates[`matches/${gameId}/locationCity`] = locationCity;
      updates[`matches/${gameId}/locationCountry`] = locationCountry;
      updates[`matches/${gameId}/date`] = item.Date;
      updates[`matches/${gameId}/timestamp`] = timestamp;
    }

    await db.ref().update(updates);
    logger.info(`Refreshed metadata for ${data.Results.length} matches`);
  } catch (error) {
    logger.error('Error refreshing match data:', error);
  }
});
