export { fetchMatches, getMatch, refreshMatches } from './matchService';
export type { Match, MatchesData } from './matchService';

export {
  checkUsernameAvailable,
  deleteUserAccount,
  getUserByUsername,
  handleUserLogin,
  isReservedUsername,
  sanitizeUsername,
  subscribeToLeaderboard,
  updateUserProfile,
  uploadProfilePicture,
} from './userService';
export type { UserData, UserWithId } from './userService';

export {
  getPrediction,
  getUserPredictions,
  savePrediction,
  subscribeToAllPredictions,
  subscribeToPredictions,
} from './predictionService';
export type {
  AllPredictions,
  Prediction,
  UserPredictions,
} from './predictionService';

export {
  checkSlugAvailable,
  createLeague,
  deleteLeague,
  generateSlug,
  getLeagueBySlug,
  getLeagueByInviteCode,
  getLeagueMembers,
  getLeaguesOwnedByUser,
  isLeagueMember,
  joinLeague,
  leaveLeague,
  regenerateInviteCode,
  subscribeToLeagueMembers,
  subscribeToUserLeagues,
  updateLeague,
  uploadLeagueImage,
} from './leagueService';
export type { League, LeagueWithId } from './leagueService';
