const { body } = require('express-validator/check');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');

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

exports.signupValidation = () => {
  return [
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
};
