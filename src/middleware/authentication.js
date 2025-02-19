const passport = require('passport');
const { StatusCodes } = require('http-status-codes');
const { ApiError } = require('../utils');
const { userJwtStrategy } = require('../config/passport');

// eslint-disable-next-line operator-linebreak
const verifyCallback =
  (req, resolve, reject, value) => async (err, user, info) => {
    if (err || info || !user) {
      return reject(
        new ApiError('Please Authenticate', StatusCodes.UNAUTHORIZED),
      );
    }

    if (user.deleted) {
      return reject(new ApiError('User Deleted', StatusCodes.UNAUTHORIZED));
    }

    req[value] = user;

    resolve();
  };

const userAuth = () => async (req, res, next) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => {
    passport.authenticate(
      'userJwt',
      {
        session: false,
      },
      verifyCallback(req, resolve, reject, 'user'),
    )(req, res, next);
  });

const JwtStrategy = (Passport) => {
  Passport.use('userJwt', userJwtStrategy);
};

module.exports = {
  userAuth,
  JwtStrategy,
};
