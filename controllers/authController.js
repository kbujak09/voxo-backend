const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

exports.signup = [
  body('username')
    .notEmpty()
    .withMessage('Username can not be empty.')
    .custom(value => !/\s/.test(value))
    .withMessage('No spaces are allowed in the username.')
    .trim()
    .isLength({min: 3})
    .withMessage('Username must contain at least 3 characters.')
    .isLength({max: 16})
    .withMessage('Username can not be longer than 16 characters.')
    .escape(),
  body('password')
    .notEmpty()
    .withMessage('Password can not be empty.')
    .custom(value => !/\s/.test(value))
    .withMessage('No spaces are allowed in the password.')
    .trim()
    .isLength({min: 8})
    .withMessage('Password must contain at least 8 characters.')
    .escape(),
  body('confirmPassword', 'Passwords do not match.')
    .custom((value, { req }) => value === req.body.password),

  asyncHandler(async (req, res, next) => {
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${req.body.username}$`, 'i') } });

    if (existingUser) {
      return res.status(403).json({
        username: req.body.username,
        errors: [{ message: 'Username is taken' }]
      });
    };

    const errors = validationResult(req);   

    if (!errors.isEmpty()) {
      return res.status(403).json({
        username: req.body.username,
        errors: errors.array()
      });
    };

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      const user = new User({
        username: req.body.username,
        password: hashedPassword
      });

      if (err) {
        return next(err);
      }
      else {
        user.save();
        res.status(200).json({
          message: 'User created successfully!'
        });
      };
    });
  })
];

exports.login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info && info.message ? info.message : 'Login failed',
        user: user,
        err: err ? err.message : null
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        next(err);
      }
      const json = jwt.sign(user.toJSON(), process.env.JWT_SECRET);
      return res.json({user, token});
    })
  })
  (req, res);
}