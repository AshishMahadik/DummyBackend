const express = require('express');

const router = express.Router();

const appRoutes = [];

appRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
