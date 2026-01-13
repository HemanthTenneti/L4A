const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const createReview = require("../controllers/reviews/createReview");
const getUserReviews = require("../controllers/reviews/getUserReviews");
const deleteReview = require("../controllers/reviews/deleteReview");

const router = express.Router();

// Create or update review
router.post("/", verifyToken, createReview);

// Get reviews for a user
router.get("/user/:userId", getUserReviews);

// Delete review
router.delete("/:reviewId", verifyToken, deleteReview);

module.exports = router;
