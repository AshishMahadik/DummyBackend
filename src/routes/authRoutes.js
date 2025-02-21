const express = require("express");
const {
  register,
  login,
  refreshToken,
  logout,
  self
} = require('../controller/authController');

const router = express.Router();

router.post('/register', register);
router.post("/login", login);
router.get("/refresh-token", refreshToken);
router.get('/logout', logout);
router.get('/self', self);

module.exports = router;
