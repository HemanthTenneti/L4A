const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const token =
    req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authMiddleware;
