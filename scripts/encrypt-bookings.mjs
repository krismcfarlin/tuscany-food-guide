#!/usr/bin/env node
// Encrypt the private bookings file into a commit-safe ciphertext.
//
//   data/bookings.local.json   (PLAINTEXT — gitignored, never committed)
//        ↓  AES-256-GCM, key = PBKDF2-SHA256(passphrase, salt, 210000)
//   data/bookings.enc.json     (COMMIT THIS — safe to publish)
//
// Usage:
//   node scripts/encrypt-bookings.mjs          # prompts twice for a hidden passphrase
//   BOOKINGS_KEY=... node scripts/encrypt-bookings.mjs   # non-interactive (CI/tests)
//
// The journal page asks for the same passphrase to decrypt at runtime.
// Re-running the script after editing the plaintext is how you rotate content;
// re-running it with a new passphrase is how you rotate the key.

import { readFileSync, writeFileSync } from 'node:fs';
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';

const IN = process.env.BOOKINGS_PLAIN || 'data/bookings.local.json';
const OUT = process.env.BOOKINGS_OUT || 'data/bookings.enc.json';
const ITER = 210000;

async function askHidden(question) {
  if (!process.stdin.isTTY) throw new Error('no TTY for hidden prompt (set BOOKINGS_KEY instead)');
  process.stdout.write(question);
  const stdin = process.stdin;
  stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
  let buf = '';
  return new Promise((resolve, reject) => {
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false); stdin.pause(); stdin.removeListener('data', onData);
          process.stdout.write('\n'); resolve(buf); return;
        }
        if (ch === '\u0003') { process.stdout.write('\n'); process.exit(130); }
        if (ch === '\u007f') { buf = buf.slice(0, -1); continue; }
        buf += ch;
      }
    };
    stdin.on('data', onData);
  });
}

let passphrase = process.env.BOOKINGS_KEY;
if (!passphrase) {
  passphrase = await askHidden('Passphrase: ');
  const again = await askHidden('Repeat:    ');
  if (passphrase !== again) { console.error('passphrases did not match'); process.exit(1); }
}
if (!passphrase) { console.error('passphrase required'); process.exit(1); }
if (passphrase.length < 8) console.warn('warning: short passphrase — brute-forceable; fine for convenience, not for secrets you must keep long-term');

let plain;
try { plain = readFileSync(IN, 'utf8'); JSON.parse(plain); }
catch (e) { console.error(`cannot read valid JSON from ${IN}: ${e.message}`); process.exit(1); }

const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(passphrase, salt, ITER, 32, 'sha256');
const cipher = createCipheriv('aes-256-gcm', key, iv);
const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final(), cipher.getAuthTag()]);

const out = { v: 1, alg: 'AES-256-GCM', kdf: `PBKDF2-SHA256:${ITER}`, placeholder: false,
  salt: salt.toString('base64'), iv: iv.toString('base64'), data: data.toString('base64') };
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`encrypted ${JSON.parse(plain).length} booking(s) -> ${OUT}`);
