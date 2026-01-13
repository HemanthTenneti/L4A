const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const getChatRoom = require("../controllers/chats/getChatRoom");
const getChatMessages = require("../controllers/chats/getChatMessages");
const sendMessage = require("../controllers/chats/sendMessage");
const getUserRooms = require("../controllers/chats/getUserRooms");
const leaveRoom = require("../controllers/chats/leaveRoom");

const router = express.Router();

router.get("/rooms/my-rooms", verifyToken, getUserRooms);
router.post("/:chatRoomId/leave", verifyToken, leaveRoom);
router.get("/:id/messages", verifyToken, getChatMessages);
router.post("/:id/messages", verifyToken, sendMessage);
router.get("/:id", verifyToken, getChatRoom);

module.exports = router;
