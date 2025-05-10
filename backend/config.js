const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_123";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";
const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

module.exports = {
  JWT_SECRET,
  JWT_EXPIRY,
  SALT_ROUNDS,
  MAX_LOGIN_ATTEMPTS,
  LOGIN_TIMEOUT
};
