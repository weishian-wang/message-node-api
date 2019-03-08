const { body } = require('express-validator/check');
const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
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
  const hashedPw = bcrypt.hashSync(password, 12);

  const user = new User({
    name: name,
    email: email,
    password: hashedPw
  });

  try {
    await user.save();
    res.status(201).json({ message: 'You have successfully signed up.' });
  } catch (err) {
    next(err);
  }
};

exports.signin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed. Entered data is incorrect.');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 401;
      throw error;
    }
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      const error = new Error('Wrong password.');
      error.statusCode = 401;
      throw error;
    }
    const userId = user._id.toString();

    const token = jwt.sign(
      { email: user.email, userId: userId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token: token,
      userId: userId,
      userEmail: user.email
    });
  } catch (err) {
    next(err);
  }
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
