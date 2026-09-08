import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeIdentity } from '../../dist/routes/auth.js';

test('normalizes Indonesian WhatsApp number variants to E.164', () => {
  for (const input of ['0812-3456-7890', '6281234567890', '+62 812 3456 7890', '81234567890']) {
    assert.deepEqual(normalizeIdentity(input), { phone: '+6281234567890' });
  }
});

test('normalizes email casing and whitespace', () => {
  assert.deepEqual(normalizeIdentity('  PETANI@Example.COM '), { email: 'petani@example.com' });
});

test('rejects malformed identities', () => {
  for (const input of ['', '0812abc789', '0812', 'petani@invalid']) {
    assert.throws(() => normalizeIdentity(input));
  }
});
