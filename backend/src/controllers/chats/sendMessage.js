const prisma = require("../../utils/db");
const { getIO } = require("../../utils/socket");
const { z } = require("zod");

const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const validatedData = sendMessageSchema.parse(req.body);

    // Check if user is a participant
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      select: {
        id: true,
        participants: {
          where: { userId },
        },
      },
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    if (!chatRoom.participants.length) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this chat",
      });
    }

    const message = await prisma.message.create({
      data: {
        content: validatedData.content,
        senderId: userId,
        chatRoomId: id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Emit the message to all users in the chat room
    const io = getIO();
    const roomMembers = io.sockets.adapter.rooms.get(id);
    console.log(
      `Broadcasting message to room ${id} with ${
        roomMembers?.size || 0
      } members`
    );

    io.to(id).emit("message:new", {
      success: true,
      data: message,
    });

    console.log(
      `Message from ${userId} in room ${id}: ${validatedData.content}`
    );

    res.status(201).json({
      success: true,
      data: message,
      message: "Message sent",
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = sendMessage;
