const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/auth");
const postsRoutes = require("./routes/posts");
const categoriesRoutes = require("./routes/categories");
const chatsRoutes = require("./routes/chats");
const notificationsRoutes = require("./routes/notifications");
const usersRoutes = require("./routes/users");
const reviewsRoutes = require("./routes/reviews");
const favoritesRoutes = require("./routes/favorites");

const app = express();

app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("Server is online and running! Visit other routes to interact.");
});
app.use("/auth", authRoutes);
app.use("/posts", postsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/chats", chatsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/users", usersRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/favorites", favoritesRoutes);

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
