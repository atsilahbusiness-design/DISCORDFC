import assert from 'node:assert/strict';
import test from 'node:test';
import { careerControls, detailedTrainingControls, trainingControls } from '../src/discord/components.js';

test('career components are owner-bound and actionable', () => {
  const rows = careerControls('user-1').map((row) => row.toJSON());
  const ids = rows.flatMap((row) => row.components.map((component) => component.custom_id));
  assert.deepEqual(ids, ['frs:user-1:profile', 'frs:user-1:train', 'frs:user-1:match', 'frs:user-1:club', 'frs:user-1:coach-profile', 'frs:user-1:versus-profile']);
  assert.equal(ids.every((id) => id.startsWith('frs:user-1:')), true);
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
