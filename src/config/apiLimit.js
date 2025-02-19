// eslint-disable-next-line import/no-extraneous-dependencies
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  skipSuccessfulRequests: true,
  message: 'Too many request from this ip. please try agin in an hour',
});

module.exports = limiter;
