import assert from 'node:assert/strict';
import { test } from 'node:test';
import { previewPosition } from '../src/ar-geometry.ts';

test('preview stays in front of an unrotated WebXR viewer', () => {
  assert.deepEqual(previewPosition({ x: 1, y: 2, z: 3 }, { x: 0, y: 0, z: 0, w: 1 }),
    { x: 1, y: 1.88, z: 2.3 });
});

test('preview follows viewer yaw rather than the desktop camera', () => {
  const result = previewPosition({ x: 1, y: 2, z: 3 }, { x: 0, y: 1, z: 0, w: 0 });
  assert.ok(Math.abs(result.x - 1) < 1e-10);
  assert.ok(Math.abs(result.y - 1.88) < 1e-10);
  assert.ok(Math.abs(result.z - 3.7) < 1e-10);
});
