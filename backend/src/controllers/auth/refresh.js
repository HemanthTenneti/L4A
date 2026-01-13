const {
  verifyRefreshToken,
  generateAccessToken,
} = require("../../utils/token");

const refresh = async (req, res) => {
  try {
    // Check both cookies and request body for refresh token
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(decoded.userId);
    res.status(200).json({
      success: true,
      message: "Access token refreshed",
      data: { accessToken },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = refresh;
