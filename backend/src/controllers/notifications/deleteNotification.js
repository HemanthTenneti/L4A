const prisma = require("../../utils/db");

const deleteNotification = async (req, res) => {
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
        message: "Not authorized to delete this notification",
      });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = deleteNotification;
