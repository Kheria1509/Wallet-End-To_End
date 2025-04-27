const rateLimit = require('express-rate-limit');
const { MAX_LOGIN_ATTEMPTS, LOGIN_TIMEOUT } = require('../config');

const loginLimiter = rateLimit({
    windowMs: LOGIN_TIMEOUT,
    max: MAX_LOGIN_ATTEMPTS,
    message: {
        status: 429,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter
};