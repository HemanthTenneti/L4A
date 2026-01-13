const express = require("express");
const getPublicProfile = require("../controllers/users/getPublicProfile");
const getUserPosts = require("../controllers/users/getUserPosts");

const router = express.Router();

router.get("/:userId/profile", getPublicProfile);
router.get("/:userId/posts", getUserPosts);

module.exports = router;
