const express = require('express');

const router = express.Router();

const authRoutes = require("./authRoutes");
const employeeRoutes = require("./employeeRoutes");

const appRoutes = [
  {
    path: '/api/auth',
    route: authRoutes,
  },
  {
    path: '/api/employees',
    route: employeeRoutes,
  },
];

appRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
