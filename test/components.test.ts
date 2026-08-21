import assert from 'node:assert/strict';
import test from 'node:test';
import { careerControls, trainingControls } from '../src/discord/components.js';

test('career components are owner-bound and actionable', () => {
  const rows = careerControls('user-1').map((row) => row.toJSON());
  const ids = rows.flatMap((row) => row.components.map((component) => component.custom_id));
  assert.deepEqual(ids, ['frs:user-1:profile', 'frs:user-1:train', 'frs:user-1:match', 'frs:user-1:club']);
});

test('training component exposes all six abilities', () => {
  const rows = trainingControls('user-2').map((row) => row.toJSON());
  const select = rows[0].components[0];
  assert.equal(select.custom_id, 'frs:user-2:train-select');
  assert.deepEqual(select.options?.map((option) => option.value), ['atk', 'def', 'speed', 'power', 'strength', 'technique']);
});
