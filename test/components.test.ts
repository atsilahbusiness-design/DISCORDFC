import assert from 'node:assert/strict';
import test from 'node:test';
import { careerControls, detailedTrainingControls, trainingControls, versusFinalizeControls, versusHomeControls, versusPositionControls, versusSetupControls } from '../src/discord/components.js';
import { createInitialProfile } from '../src/domain/engine.js';
import { createVersusClub } from '../src/domain/versus-engine.js';

test('career components are owner-bound and actionable', () => {
  const rows = careerControls('user-1').map((row) => row.toJSON());
  const ids = rows.flatMap((row) => row.components.map((component) => component.custom_id));
  assert.deepEqual(ids, ['frs:user-1:profile', 'frs:user-1:train', 'frs:user-1:match', 'frs:user-1:club', 'frs:user-1:coach-profile', 'frs:user-1:versus-home']);
  assert.equal(ids.every((id) => id.startsWith('frs:user-1:')), true);
});

test('Versus Home and lineup controls preserve owner, battle, and roster context', () => {
  const profile = createVersusClub(createInitialProfile('user-4', 'Versus UI', 'MF'), new Date('2026-01-01T00:00:00.000Z'));
  const roster = profile.versus!.club.roster;
  const setup = versusSetupControls('user-4', 'battle:1', 3, '4-4-2', 'balanced').flatMap((row) => row.toJSON().components.map((component) => component.custom_id));
  assert.ok(setup.every((id) => id?.startsWith('frs:user-4:')));
  assert.ok(setup.some((id) => id?.includes('battle%3A1')));
  const selected = { GK: [], DF: [], MF: [], FW: [] };
  const positions = versusPositionControls('user-4', 'battle:1', 3, '4-4-2', roster, selected);
  assert.equal(positions.length, 5);
  assert.equal(positions.slice(0, 4).every((row) => row.toJSON().components[0].custom_id?.includes('3')), true);
  const lineup = roster.filter((player) => ['GK', 'DF', 'MF', 'FW'].includes(player.position)).slice(0, 11).map((player) => player.id);
  const final = versusFinalizeControls('user-4', 'battle:1', 3, lineup, roster);
  assert.equal(final.length, 3);
  assert.equal(final.flatMap((row) => row.toJSON().components.map((component) => component.custom_id)).every((id) => id?.startsWith('frs:user-4:')), true);
  const home = versusHomeControls('user-4').flatMap((row) => row.toJSON().components.map((component) => component.custom_id));
  assert.equal(home.every((id) => id?.startsWith('frs:user-4:')), true);
  for (const action of ['versus-registration', 'versus-market', 'versus-rewards', 'versus-schedule', 'versus-rankings', 'versus-global-ranking']) assert.ok(home.includes(`frs:user-4:${action}`));
});

test('training component exposes all six abilities', () => {
  const rows = trainingControls('user-2').map((row) => row.toJSON());
  const select = rows[0].components[0];
  assert.equal(select.custom_id, 'frs:user-2:train-select');
  assert.deepEqual(select.options?.map((option) => option.value), ['atk', 'def', 'speed', 'power', 'strength', 'technique']);
});

test('detailed training component exposes all twelve detailed skills', () => {
  const rows = detailedTrainingControls('user-3').map((row) => row.toJSON());
  const select = rows[0].components[0];
  assert.equal(select.custom_id, 'frs:user-3:detailed-train-select');
  assert.equal(select.options?.length, 12);
  assert.equal(select.options?.some((option) => option.value === 'willpower'), true);
});
