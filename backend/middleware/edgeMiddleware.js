const { jwtVerify } = require('jose');
const { JWT_SECRET } = require("../config");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(
      token,
      encoder.encode(JWT_SECRET)
    );

    // Check if token has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTimestamp) {
      return res.status(401).json({
        message: "Token has expired, please login again"
      });
    }

    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err.name === 'JWTExpired') {
      return res.status(401).json({
        message: "Token has expired, please login again"
      });
    }
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

module.exports = {
  authMiddleware
}; 