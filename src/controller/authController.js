/* eslint-disable curly */
/* eslint-disable arrow-body-style */
/* eslint-disable nonblock-statement-body-position */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  generateAuthTokens,
  generateRefreshToken,
} = require('../services/jsonwebtoken.service');
const env = require('../env');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });
    const { token } = await generateAuthTokens({ user: user });
    const { token: refreshToken } = await generateRefreshToken({ user: user });
    user.refreshToken = refreshToken;
    user.save();
    res.cookie('rtjwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.refreshToken = async (req, res) => {
  const { cookies } = req;
  if (!cookies?.rtjwt) return res.sendStatus(401);
  const refreshToken = cookies.rtjwt;

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, env, (err, decoded) => {
    if (err || foundUser.name !== decoded.name) {
      return res.sendStatus(403);
    }
    const accessToken = jwt.sign(
      {
        id: foundUser._id,
        role: foundUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );
    res.json({ accessToken });
  });
};

exports.logout = async (req, res) => {
  // On client, also delete the accessToken

  const { cookies } = req;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie('rtjwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    return res.sendStatus(204);
  }

  // Delete refreshToken in db
  foundUser.refreshToken = '';
  const result = await foundUser.save();

  res.clearCookie('rtjwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.sendStatus(204, { result });
};

exports.self = async (req, res) => {
  res.send('Hi');
};
