const crypto = require("crypto");

/**
 * Hand-written TOTP (RFC 6238) built on HOTP (RFC 4226).
 * Only dependency: Node's built-in crypto module for HMAC-SHA1.
 * No third-party TOTP/authenticator libraries used.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

// --- Base32 encode/decode (needed because authenticator apps expect base32 secrets) ---

function base32Encode(buffer) {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5);
    output += BASE32_ALPHABET[parseInt(chunk, 2)];
  }

  // Handle leftover bits (pad with zeros to make a full 5-bit chunk)
  const remainder = bits.length % 5;
  if (remainder !== 0) {
    const lastChunk = bits.substring(bits.length - remainder).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(lastChunk, 2)];
  }

  return output;
}

function base32Decode(base32Str) {
  const cleaned = base32Str.toUpperCase().replace(/=+$/, "");

  let bits = "";
  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue; // skip invalid chars
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

// --- HOTP (RFC 4226): counter-based one-time password ---

function hotp(secretBuffer, counter, digits = 6) {
  // Counter must be an 8-byte big-endian buffer
  const counterBuffer = Buffer.alloc(8);
  // Write as two 32-bit halves since JS numbers can't safely hold full 64-bit ints
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4);

  // HMAC-SHA1 of the counter, keyed by the secret
  const hmac = crypto.createHmac("sha1", secretBuffer).update(counterBuffer).digest();

  // Dynamic truncation (RFC 4226 section 5.3)
  const offset = hmac[hmac.length - 1] & 0x0f;

  const binaryCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binaryCode % 10 ** digits;

  return otp.toString().padStart(digits, "0");
}

// --- TOTP (RFC 6238): time-based wrapper around HOTP ---

function generateSecret(byteLength = 20) {
  const randomBytes = crypto.randomBytes(byteLength);
  return base32Encode(randomBytes);
}

function totp(base32Secret, { step = 30, digits = 6, timestamp = Date.now() } = {}) {
  const secretBuffer = base32Decode(base32Secret);
  const counter = Math.floor(timestamp / 1000 / step);
  return hotp(secretBuffer, counter, digits);
}

/**
 * Verifies a user-entered code, allowing a small window of time steps
 * before/after "now" to tolerate clock drift and slow typing.
 */
function verifyTotp(base32Secret, token, { step = 30, digits = 6, window = 1 } = {}) {
  const now = Date.now();

  for (let errorWindow = -window; errorWindow <= window; errorWindow++) {
    const shiftedTimestamp = now + errorWindow * step * 1000;
    const expected = totp(base32Secret, { step, digits, timestamp: shiftedTimestamp });

    if (expected === token) {
      return true;
    }
  }

  return false;
}

// Builds the otpauth:// URI that Google Authenticator/Authy scan or accept manually
function buildOtpauthUrl(base32Secret, { issuer = "SnackOverflow", accountName }) {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

module.exports = {
  base32Encode,
  base32Decode,
  hotp,
  generateSecret,
  totp,
  verifyTotp,
  buildOtpauthUrl,
};