const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const categoriesRoutes = require("./routes/categories");
const chatsRoutes = require("./routes/chats");

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Server is online and running! Visit other routes to interact.");
});
app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/chats", chatsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
