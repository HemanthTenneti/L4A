require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const app = require("./app");
const { setIO } = require("./utils/socket");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins for Socket.IO in production
      }
    },
    credentials: true,
  },
});

setIO(io);

const userSockets = new Map();
const typingUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", socket => {
  console.log(
    `User ${socket.username} (${socket.userId}) connected: ${socket.id}`
  );
  userSockets.set(socket.userId, socket.id);

  socket.emit("user:connected", {
    userId: socket.userId,
    username: socket.username,
    socketId: socket.id,
  });

  socket.on("chat:join", data => {
    const { chatRoomId } = data;
    socket.join(chatRoomId);
    console.log(
      `User ${socket.username} (${socket.userId}) joined room ${chatRoomId}`
    );
    console.log(
      `Room ${chatRoomId} now has ${
        io.sockets.adapter.rooms.get(chatRoomId)?.size || 0
      } members`
    );

    io.to(chatRoomId).emit("chat:user-joined", {
      userId: socket.userId,
      username: socket.username,
      timestamp: new Date(),
    });
  });

  socket.on("chat:leave", data => {
    const { chatRoomId } = data;
    socket.leave(chatRoomId);
    console.log(`User ${socket.username} left room ${chatRoomId}`);

    io.to(chatRoomId).emit("chat:user-left", {
      userId: socket.userId,
      username: socket.username,
      timestamp: new Date(),
    });
  });

  socket.on("message:send", data => {
    const { chatRoomId, content } = data;

    io.to(chatRoomId).emit("message:receive", {
      id: Math.random().toString(36).substring(7),
      chatRoomId,
      senderId: socket.userId,
      senderUsername: socket.username,
      content,
      type: "TEXT",
      createdAt: new Date(),
      isDeleted: false,
    });

    console.log(
      `Message from ${socket.username} in room ${chatRoomId}: ${content}`
    );
  });

  socket.on("typing:start", data => {
    const { chatRoomId } = data;

    if (!typingUsers.has(chatRoomId)) {
      typingUsers.set(chatRoomId, new Set());
    }
    typingUsers.get(chatRoomId).add(socket.userId);

    io.to(chatRoomId).emit("typing:users", {
      typingUserIds: Array.from(typingUsers.get(chatRoomId) || []),
    });
  });

  socket.on("typing:stop", data => {
    const { chatRoomId } = data;

    if (typingUsers.has(chatRoomId)) {
      typingUsers.get(chatRoomId).delete(socket.userId);

      if (typingUsers.get(chatRoomId).size === 0) {
        typingUsers.delete(chatRoomId);
      }
    }

    io.to(chatRoomId).emit("typing:users", {
      typingUserIds: Array.from(typingUsers.get(chatRoomId) || []),
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.username} (${socket.userId}) disconnected`);
    userSockets.delete(socket.userId);

    typingUsers.forEach((users, chatRoomId) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        io.to(chatRoomId).emit("typing:users", {
          typingUserIds: Array.from(typingUsers.get(chatRoomId) || []),
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
