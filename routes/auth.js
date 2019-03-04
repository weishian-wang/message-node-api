const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', authController.authValidation('signup'), authController.signup);

router.post('/signin', authController.authValidation('signin'), authController.signin);

module.exports = router;
