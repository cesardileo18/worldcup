import { db } from '../firebase';
import { ref, get, set, onValue, type Unsubscribe } from 'firebase/database';
import { mockPredictionsPath } from '../mock/mockPredictionStore';
import { isMockModeEnabled } from '../utils';

export interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
  updatedAt: number;
}

export interface UserPredictions {
  [gameId: string]: Prediction;
}

export interface AllPredictions {
  [userId: string]: UserPredictions;
}

/**
 * Get all predictions for a user
 */
export const getUserPredictions = async (
  userId: string
): Promise<UserPredictions> => {
  const predictionsRef = ref(
    db,
    `${isMockModeEnabled() ? mockPredictionsPath : 'predictions'}/${userId}`
  );
  const snapshot = await get(predictionsRef);

  if (!snapshot.exists()) {
    return {};
  }

  return snapshot.val() as UserPredictions;
};

/**
 * Get a single prediction for a user and game
 */
export const getPrediction = async (
  userId: string,
  gameId: string
): Promise<Prediction | null> => {
  const predictionRef = ref(
    db,
    `${isMockModeEnabled() ? mockPredictionsPath : 'predictions'}/${userId}/${gameId}`
  );
  const snapshot = await get(predictionRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.val() as Prediction;
};

/**
 * Save or update a prediction
 */
export const savePrediction = async (
  userId: string,
  gameId: string,
  homePrediction: number,
  awayPrediction: number
): Promise<void> => {
  const prediction: Prediction = {
    homePrediction,
    awayPrediction,
    points: 0, // Points will be calculated by Cloud Function
    updatedAt: Date.now(),
  };

  const predictionRef = ref(
    db,
    `${isMockModeEnabled() ? mockPredictionsPath : 'predictions'}/${userId}/${gameId}`
  );

  await set(predictionRef, prediction);
};

/**
 * Subscribe to real-time updates for a user's predictions
 */
export const subscribeToPredictions = (
  userId: string,
  callback: (predictions: UserPredictions) => void
): Unsubscribe => {
  const predictionsRef = ref(
    db,
    `${isMockModeEnabled() ? mockPredictionsPath : 'predictions'}/${userId}`
  );

  return onValue(predictionsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserPredictions);
    } else {
      callback({});
    }
  });
};

export const subscribeToAllPredictions = (
  callback: (predictions: AllPredictions) => void
): Unsubscribe => {
  const predictionsRef = ref(
    db,
    isMockModeEnabled() ? mockPredictionsPath : 'predictions'
  );

  return onValue(predictionsRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as AllPredictions);
    } else {
      callback({});
    }
  });
};
