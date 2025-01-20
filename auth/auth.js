const passport = require('passport');
const bcrypt = require('bcryptjs');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('../models/user');

passport.use(
  new LocalStrategy( async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });

      if (!user) {
        return done(null, false, { message: 'User not found.' });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return done (null, false, { message: 'Incorrect password.' });
      }

      return done (null, user);
    }
    catch (err) {
      return done(err);
    }
  })
);

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
  },
  async (token, done) => {
    try {
      return done(null, token);
    }
    catch (err) {
      return done(err);
    }
  }
));