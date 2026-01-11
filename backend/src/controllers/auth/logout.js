const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = logout;
