import io from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
let socket = null;

export const initializeSocket = token => {
  // If socket exists and is still valid with same token, reuse it
  if (socket?.connected) {
    console.log("Socket already connected, reusing");
    return socket;
  }

  // If socket exists but disconnected, disconnect completely before creating new one
  if (socket) {
    console.log("Disconnecting old socket before reconnecting");
    socket.disconnect();
    socket = null;
  }

  console.log("Creating new socket connection with token");
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    forceNew: false,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("connect_error", error => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const getSocket = () => socket;

export const joinChatRoom = chatRoomId => {
  if (!socket) {
    console.warn("Socket not initialized, cannot join room");
    return;
  }

  if (socket?.connected) {
    socket.emit("chat:join", { chatRoomId });
    console.log("Joined chat room:", chatRoomId);
  } else {
    console.warn("Socket not connected, cannot join room");
  }
};

export const leaveChatRoom = chatRoomId => {
  if (socket?.connected) {
    socket.emit("chat:leave", { chatRoomId });
    console.log("Left chat room:", chatRoomId);
  }
};

export const onNewMessage = callback => {
  if (!socket) {
    console.warn("Socket not initialized");
    return;
  }
  socket.on("message:new", callback);
  console.log("Message listener added");
};

export const offNewMessage = callback => {
  if (!socket) {
    console.warn("Socket not initialized");
    return;
  }
  socket.off("message:new", callback);
  console.log("Message listener removed");
};

export const emitTyping = (chatRoomId, isTyping) => {
  if (socket?.connected) {
    if (isTyping) {
      socket.emit("typing:start", { chatRoomId });
    } else {
      socket.emit("typing:stop", { chatRoomId });
    }
  }
};

export const onTyping = callback => {
  if (!socket) {
    console.warn("Socket not initialized");
    return;
  }
  socket.on("typing:users", callback);
};

export const offTyping = callback => {
  if (!socket) {
    console.warn("Socket not initialized");
    return;
  }
  socket.off("typing:users", callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
