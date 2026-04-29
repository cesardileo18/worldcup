import type { MatchesData } from '../services/matchService';

const now = Date.now();
const toIso = (offsetMs: number): string => new Date(now + offsetMs).toISOString();
const toTimestamp = (offsetMs: number): number =>
  Math.floor(new Date(now + offsetMs).getTime() / 1000);

export const mockMatches: MatchesData = {
  MOCK_001: {
    game: 'MOCK_001',
    fifaId: 'MOCK_001',
    round: 'Mock Group Stage',
    group: 'A',
    date: toIso(-2 * 24 * 60 * 60 * 1000),
    timestamp: toTimestamp(-2 * 24 * 60 * 60 * 1000),
    location: 'Mock Stadium',
    locationCity: 'Buenos Aires',
    locationCountry: 'ARG',
    home: 'ARG',
    homeName: 'Argentina',
    homeScore: 2,
    away: 'BRA',
    awayName: 'Brazil',
    awayScore: 1,
  },
  MOCK_002: {
    game: 'MOCK_002',
    fifaId: 'MOCK_002',
    round: 'Mock Group Stage',
    group: 'A',
    date: toIso(-24 * 60 * 60 * 1000),
    timestamp: toTimestamp(-24 * 60 * 60 * 1000),
    location: 'Mock Stadium',
    locationCity: 'Montevideo',
    locationCountry: 'URU',
    home: 'URU',
    homeName: 'Uruguay',
    homeScore: 0,
    away: 'COL',
    awayName: 'Colombia',
    awayScore: 0,
  },
  MOCK_003: {
    game: 'MOCK_003',
    fifaId: 'MOCK_003',
    round: 'Mock Group Stage',
    group: 'B',
    date: toIso(24 * 60 * 60 * 1000),
    timestamp: toTimestamp(24 * 60 * 60 * 1000),
    location: 'Mock Stadium',
    locationCity: 'Mexico City',
    locationCountry: 'MEX',
    home: 'MEX',
    homeName: 'Mexico',
    homeScore: -1,
    away: 'USA',
    awayName: 'United States',
    awayScore: -1,
  },
};
