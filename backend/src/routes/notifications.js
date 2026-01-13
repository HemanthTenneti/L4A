const express = require("express");
const getNotifications = require("../controllers/notifications/getNotifications");
const markAsRead = require("../controllers/notifications/markAsRead");
const deleteNotification = require("../controllers/notifications/deleteNotification");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/:notificationId/read", verifyToken, markAsRead);
router.delete("/:notificationId", verifyToken, deleteNotification);

module.exports = router;
