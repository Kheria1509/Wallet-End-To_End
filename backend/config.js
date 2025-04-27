require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "fallback_secret_key_123",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "24h",
  SALT_ROUNDS: 10,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_TIMEOUT: 15 * 60 * 1000, // 15 minutes in milliseconds
};
