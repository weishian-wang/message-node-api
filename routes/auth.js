const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', authController.signupValidation(), authController.signup);

module.exports = router;
