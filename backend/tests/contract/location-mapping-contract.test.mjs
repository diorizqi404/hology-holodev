import assert from 'node:assert/strict';
import test from 'node:test';
import { findCanonicalAdm4 } from '../../dist/infrastructure/location/canonical-adm4-map.js';

test('resolves the curated Tunggulwulung point to its verified BMKG ADM4', () => {
  assert.equal(findCanonicalAdm4({ lat: -7.927, lon: 112.613 }), '35.73.05.1001');
});

test('accepts a nearby field point inside the bounded mapping radius', () => {
  assert.equal(findCanonicalAdm4({ lat: -7.90118677, lon: 112.61180057 }), '35.73.05.1001');
});

test('refuses to infer ADM4 for a distant coordinate', () => {
  assert.equal(findCanonicalAdm4({ lat: -6.1754, lon: 106.8272 }), undefined);
});
