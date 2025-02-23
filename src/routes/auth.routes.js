const express = require('express');
const { authController } = require('../controller');
// const { authMiddleware } = require('../middleware/authMiddleware');
const { userAuth } = require('../middleware/authentication');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh-token', authController.refreshToken);
router.get('/logout', authController.logout);

// router.use()
router.get('/self', userAuth(), authController.self);

module.exports = router;
