const { body } = require('express-validator/check');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPw
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'You have successfully signed up.',
        userId: result._id
      });
    })
    .catch(next);
};

exports.signin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isValid => {
      if (!isValid) {
        const error = new Error('Wrong password.');
        error.statusCode = 401;
        throw error;
      }
      const userId = loadedUser._id.toString();
      const token = jwt.sign(
        { email: loadedUser.email, userId: userId },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );
      res.status(200).json({ token: token, userId: userId });
    })
    .catch(next);
};

exports.authValidation = route => {
  let validator;
  if (route === 'signup') {
    validator = [
      body('name')
        .trim()
        .not()
        .isEmpty(),
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
          return User.findOne({ email: value }).then(userDoc => {
            if (userDoc) return Promise.reject('Email address has been used.');
          });
        })
        .normalizeEmail(),
      body('password')
        .trim()
        .isLength({ min: 8 })
    ];
  } else if (route === 'signin') {
    validator = [
      body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
          return User.findOne({ email: value }).then(userDoc => {
            if (!userDoc) return Promise.reject('Email address not found.');
          });
        })
        .normalizeEmail(),
      body('password')
        .trim()
        .isLength({ min: 8 })
    ];
  }
  return validator;
};
