/* eslint-disable curly */
/* eslint-disable arrow-body-style */
/* eslint-disable nonblock-statement-body-position */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const moment = require('moment');
const User = require('../models/User');
const {
  generateAuthTokens,
  generateRefreshToken,
} = require('../services/jsonwebtoken.service');
const env = require('../env');
const { catchAsync } = require('../utils');
const { sessionService } = require('../services');
const { Session } = require('../models');

const register = catchAsync(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    user.password = undefined;

    res
      .status(StatusCodes.CREATED)
      .json({ message: 'User registered successfully', user });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
});

const login = catchAsync(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    user.password = undefined;

    const { token } = await generateAuthTokens({ user: user });
    const { token: refreshToken } = await generateRefreshToken({ user: user });

    await sessionService.createSession({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(moment().add(env.jwt.refreshExpireIn, 'minutes')),
    });

    res.cookie('rtjwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000 * 30,
    });
    res.status(StatusCodes.OK).json({ token, user });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
});

const refreshToken = catchAsync(async (req, res) => {
  const { cookies } = req;
  if (!cookies?.rtjwt) return res.status(StatusCodes.UNAUTHORIZED).json({});
  const cookieRefreshToken = cookies.rtjwt;

  const session = await Session.findOne({
    refreshToken: cookieRefreshToken,
  }).exec();
  if (!session) return res.status(StatusCodes.FORBIDDEN);

  const foundUser = await User.findById(session.userId).exec();
  if (!foundUser) return res.status(StatusCodes.FORBIDDEN).json({});

  // evaluate jwt
  jwt.verify(cookieRefreshToken, env.jwt.secret, async (err, decoded) => {
    if (err || String(foundUser._id) !== decoded.sub) {
      await Session.deleteOne({ _id: session._id }).exec();
      res.clearCookie('rtjwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
      return res.status(StatusCodes.FORBIDDEN).json({});
    }
    const { token } = await generateAuthTokens({ user: foundUser });
    res.status(StatusCodes.OK).json({ accessToken: token, user: foundUser });
  });
});

const logout = catchAsync(async (req, res) => {
  const { cookies } = req;
  if (!cookies?.rtjwt) return res.status(StatusCodes.NO_CONTENT);
  const cookieRefreshToken = cookies.rtjwt;

  // Delete the session
  await Session.deleteOne({ refreshToken: cookieRefreshToken }).exec();

  // Clear refresh token from cookies
  res.clearCookie('rtjwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });

  res.status(StatusCodes.OK).json({});
});

const self = catchAsync(async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  self,
};
