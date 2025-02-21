const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { tokenTypes } = require('../config/token');
const env = require('../env');

const generateToken = async ({
  userId,
  type,
  expire,
  secret = env.jwt.secret,
} = {}) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expire.unix(),
    type,
  };

  return jwt.sign(payload, secret);
};

const verifyToken = async ({ token, secret = env.jwt.secret } = {}) => {
  const decoded = await promisify(jwt.verify)(token, secret);

  return decoded;
};

const generateAuthTokens = async ({ user } = {}) => {
  const accessTokenExpires = moment().add(env.jwt.expireIn, 'minutes');
  const accessToken = await generateToken({
    userId: user._id,
    type: tokenTypes.ACCESS,
    expire: accessTokenExpires,
  });

  return {
    token: accessToken,
    expires: accessTokenExpires.toDate(),
  };
};

const generateRefreshToken = async ({ user } = {}) => {
  const refreshTokenExpires = moment().add(env.jwt.refreshExpireIn, 'minutes');
  const accessToken = await generateToken({
    userId: user._id,
    type: tokenTypes.REFRESH,
    expire: refreshTokenExpires,
  });

  return {
    token: accessToken,
    expires: refreshTokenExpires.toDate(),
  };
};

module.exports = {
  generateToken,
  verifyToken,
  generateAuthTokens,
  generateRefreshToken
};
