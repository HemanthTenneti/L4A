const TOAST_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

const createToast = (type, message, duration = 3000) => {
  return {
    type,
    message,
    duration,
    timestamp: new Date().toISOString(),
  };
};

const sendToastToRoom = (roomId, toast) => {
  const { getIO } = require("./socket");
  const io = getIO();

  if (io) {
    io.to(roomId).emit("toast", toast);
  }
};

module.exports = { TOAST_TYPES, createToast, sendToastToRoom };
