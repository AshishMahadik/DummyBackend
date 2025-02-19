const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const env = require('../env');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: env.jwt.secret,
};
// write jwtverify methods for user seperatly
const userJwtVerify = async (payload, done) => {
  try {
    done(null, true);
  } catch (err) {
    done(err, false);
  }
};

const userJwtStrategy = new JwtStrategy(jwtOptions, userJwtVerify);

module.exports = {
  userJwtStrategy,
};
