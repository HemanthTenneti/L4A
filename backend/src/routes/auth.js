const express = require("express");
const register = require("../controllers/auth/register");
const login = require("../controllers/auth/login");
const logout = require("../controllers/auth/logout");
const refresh = require("../controllers/auth/refresh");
const getMe = require("../controllers/auth/getMe");
const updateProfile = require("../controllers/auth/updateProfile");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);

module.exports = router;
