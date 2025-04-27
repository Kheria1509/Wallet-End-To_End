const bcrypt = require('bcryptjs');
const zxcvbn = require('zxcvbn');
const { SALT_ROUNDS } = require('../config');

const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const validatePasswordStrength = (password) => {
    const result = zxcvbn(password);
    
    if (result.score < 2) {
        return {
            isValid: false,
            message: "Password is too weak. Please include a mix of letters, numbers, and symbols."
        };
    }
    
    if (password.length < 8) {
        return {
            isValid: false,
            message: "Password must be at least 8 characters long"
        };
    }

    return {
        isValid: true,
        message: "Password strength is good"
    };
};

module.exports = {
    hashPassword,
    comparePassword,
    validatePasswordStrength
};