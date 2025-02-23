const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const env = require('../env');
const User = require('../models/User');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt.secret,
};
// write jwtverify methods for user seperatly
const userJwtVerify = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);

    if (!user || user.deleted) {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err, false);
  }
};

const userJwtStrategy = new JwtStrategy(jwtOptions, userJwtVerify);

module.exports = {
  userJwtStrategy,
};
