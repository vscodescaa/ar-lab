import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

test('generated GLB loads as a correctly sized visible model', async () => {
  const bytes = await readFile('public/models/bowling-ball.glb');
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const model = await new GLTFLoader().parseAsync(buffer, '');
  let meshCount = 0;
  model.scene.traverse(object => {
    if (object.isMesh && object.visible) meshCount += 1;
  });
  const size = new Box3().setFromObject(model.scene).getSize(new Vector3());
  assert.ok(meshCount >= 1, 'the GLB must contain visible meshes');
  assert.ok(size.x >= 0.2 && size.x <= 0.25, `unexpected width: ${size.x}`);
  assert.ok(size.y >= 0.2 && size.y <= 0.25, `unexpected height: ${size.y}`);
  assert.ok(size.z >= 0.2 && size.z <= 0.25, `unexpected depth: ${size.z}`);
});
