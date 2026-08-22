import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createInitialProfile, getRating, playMatch, SeededRandom, trainPlayer } from '../src/domain/engine.js';
import { PLAYER_FORMULA_VERSION } from '../src/domain/player-formulas.js';
import type { Position } from '../src/domain/types.js';

const now = new Date('2026-01-01T00:00:00.000Z');
const positions: Position[] = ['GK', 'DF', 'MF', 'FW'];

const observations = positions.map((position, index) => {
  const base = createInitialProfile(`calibration-${position.toLowerCase()}`, `Calibration ${position}`, position, now);
  const trained = trainPlayer(base, 'technique', now, new SeededRandom(10_000 + index)).profile;
  const match = playMatch(base, now, new SeededRandom(20_000 + index));
  return {
    observationId: `player-probe-${position.toLowerCase()}`,
    source: 'DISCORDFC_DETERMINISTIC_PROBE',
    formulaVersion: PLAYER_FORMULA_VERSION,
    position,
    initialRating: getRating(base),
    ratingAfterTechniqueTraining: getRating(trained),
    trainingEnergyAfter: trained.energy,
    match: {
      opponent: match.record.opponent,
      opponentRating: match.record.opponentRating,
      playerRating: match.record.playerRating,
      outcome: match.record.outcome,
      playerGoals: match.record.playerGoals,
      opponentGoals: match.record.opponentGoals,
      playerScore: match.record.playerScore,
      rewards: match.record.rewards,
      formulaVersion: match.record.formulaVersion
    }
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  status: 'PROBE_ONLY',
  note: 'Deterministic DISCORDFC probe. It is not an observation of the original client and must not be used to promote inferred values to official calibration.',
  formulaVersion: PLAYER_FORMULA_VERSION,
  observations
};

const outputPath = process.argv[2];
if (outputPath) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
