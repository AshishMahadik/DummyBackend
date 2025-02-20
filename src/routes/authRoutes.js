const express = require("express");
const { register, login, refreshToken } = require("../controller/authController");

const router = express.Router();

router.post('/register', register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;
