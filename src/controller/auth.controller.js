/* eslint-disable curly */
/* eslint-disable arrow-body-style */
/* eslint-disable nonblock-statement-body-position */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/User');
const {
  generateAuthTokens,
  generateRefreshToken,
} = require('../services/jsonwebtoken.service');
const env = require('../env');
const { catchAsync } = require('../utils');

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
    if (!user)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });
    const { token } = await generateAuthTokens({ user: user });
    const { token: refreshToken } = await generateRefreshToken({ user: user });
    user.refreshToken = refreshToken;
    await user.save();
    user.password = undefined;
    res.cookie('rtjwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000 * 30,
    });
    res.json({ token, user });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Server error' });
  }
});

const refreshToken = catchAsync(async (req, res) => {
  const { cookies } = req;
  if (!cookies?.rtjwt) return res.sendStatus(StatusCodes.UNAUTHORIZED);
  const cookieRefreshToken = cookies.rtjwt;

  const foundUser = await User.findOne({
    refreshToken: cookieRefreshToken,
  }).exec();
  if (!foundUser) return res.sendStatus(StatusCodes.FORBIDDEN); //Forbidden
  // evaluate jwt
  jwt.verify(cookieRefreshToken, env.jwt.secret, async (err, decoded) => {
    if (err || String(foundUser._id) !== decoded.sub) {
      res.clearCookie('rtjwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }
    const { token } = await generateAuthTokens({ user: foundUser });
    res.json({ accessToken: token, user: foundUser });
  });
});

const logout = catchAsync(async (req, res) => {
  const { cookies } = req;
  if (!cookies?.rtjwt) return res.sendStatus(StatusCodes.NO_CONTENT);
  const cookieRefreshToken = cookies.rtjwt;

  const foundUser = await User.findOne({
    refreshToken: cookieRefreshToken,
  }).exec();

  if (!foundUser) {
    res.clearCookie('rtjwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    return res.sendStatus(StatusCodes.NO_CONTENT);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = '';
  const user = await foundUser.save();

  res.clearCookie('rtjwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.sendStatus(StatusCodes.OK, { user });
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
