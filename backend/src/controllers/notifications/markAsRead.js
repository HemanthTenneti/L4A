const prisma = require("../../utils/db");

const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this notification",
      });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: updated,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = markAsRead;
