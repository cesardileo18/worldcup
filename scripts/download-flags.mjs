/**
 * Script to download missing team flags from the FIFA API.
 * Usage: node scripts/download-flags.mjs
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FLAGS_DIR = join(__dirname, '../web/src/assets/flags');
const FIFA_API_URL = 'https://api.fifa.com/api/v3/calendar/matches?idseason=285023&idcompetition=17&count=500';

async function main() {
  console.log('Fetching matches from FIFA API...');
  const res = await fetch(FIFA_API_URL);
  if (!res.ok) throw new Error(`FIFA API error: ${res.status}`);
  const data = await res.json();

  // Collect unique teams
  const teams = new Map(); // abbreviation -> { name, idTeam, pictureUrl }

  for (const match of data.Results) {
    for (const side of ['Home', 'Away']) {
      const team = match[side];
      const placeholder = side === 'Home' ? match.PlaceHolderA : match.PlaceHolderB;
      const abbr = team?.Abbreviation ?? placeholder;

      if (abbr && !teams.has(abbr)) {
        teams.set(abbr, {
          name: team?.ShortClubName ?? placeholder,
          idTeam: team?.IdTeam ?? null,
          pictureUrl: team?.PictureUrl ?? null,
        });
      }
    }
  }

  console.log(`Found ${teams.size} unique teams`);

  // Show first team raw data for debugging
  const firstMatch = data.Results[0];
  console.log('\nSample Home team fields:', JSON.stringify(firstMatch?.Home, null, 2));

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const [abbr, team] of teams) {
    const flagPath = join(FLAGS_DIR, `${abbr}.png`);

    if (existsSync(flagPath)) {
      skipped++;
      continue;
    }

    // Try different FIFA API image URLs
    // Skip knockout placeholders like "2A", "1C", "3ABCDF", etc.
    if (/^[123][A-Z0-9]+$/.test(abbr) && abbr.length <= 8 && !team.idTeam) {
      skipped++;
      continue;
    }

    const urlsToTry = [
      `https://api.fifa.com/api/v3/picture/flags-sq-2/${abbr}`,
      `https://api.fifa.com/api/v3/picture/flags-sq-1/${abbr}`,
    ];

    let success = false;
    for (const url of urlsToTry) {
      try {
        const imgRes = await fetch(url);
        if (!imgRes.ok) continue;
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        writeFileSync(flagPath, buffer);
        console.log(`✅ Downloaded: ${abbr} (${team.name})`);
        downloaded++;
        success = true;
        break;
      } catch {
        // try next URL
      }
    }

    if (!success) {
      console.log(`❌ Failed: ${abbr} (${team.name}) — tried: ${urlsToTry.join(', ')}`);
      failed++;
    }
  }

  console.log(`\nDone: ${downloaded} downloaded, ${skipped} already existed, ${failed} failed`);
}

main().catch(console.error);
