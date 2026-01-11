const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const createPost = require("../controllers/posts/createPost");
const getPosts = require("../controllers/posts/getPosts");
const getPost = require("../controllers/posts/getPost");
const updatePost = require("../controllers/posts/updatePost");
const deletePost = require("../controllers/posts/deletePost");
const closePost = require("../controllers/posts/closePost");

const router = express.Router();

router.post("/", verifyToken, createPost);
router.get("/", getPosts);
router.get("/:id", getPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.post("/:id/close", verifyToken, closePost);

module.exports = router;
