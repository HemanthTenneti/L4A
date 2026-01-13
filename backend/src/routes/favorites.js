const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const toggleFavorite = require("../controllers/favorites/toggleFavorite");
const getUserFavorites = require("../controllers/favorites/getUserFavorites");
const checkFavorite = require("../controllers/favorites/checkFavorite");

const router = express.Router();

// Toggle favorite (add or remove)
router.post("/:postId", verifyToken, toggleFavorite);

// Get user's favorites
router.get("/", verifyToken, getUserFavorites);

// Check if post is favorited
router.get("/:postId/check", verifyToken, checkFavorite);

module.exports = router;
