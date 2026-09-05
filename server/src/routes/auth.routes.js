const { Router } = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  requestOTP,
  verifyOTP,
  register,
  login,
  getProfile,
  updateProfile,
  requestForgotPasswordOTP,
  resetForgotPassword,
} = require('../controllers/auth.controller');

const router = Router();

router.post(
  '/request-otp',
  [
    body('phone')
      .trim()
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage('Valid 10-digit phone number required'),
  ],
  validate,
  requestOTP
);

router.post(
  '/verify-otp',
  [
    body('phone')
      .trim()
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage('Valid 10-digit phone number required'),
    body('otp')
      .trim()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('Valid 6-digit OTP required'),
  ],
  validate,
  verifyOTP
);

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone')
      .trim()
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage('Valid 10-digit phone number required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP verification is required'),
    body('village').optional({ checkFalsy: true }).trim(),
    body('district').optional({ checkFalsy: true }).trim(),
    body('state').optional({ checkFalsy: true }).trim(),
    body('aadhaar_last4')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage('Aadhaar last 4 digits must be exactly 4 numbers'),
    body('bank_name').optional({ checkFalsy: true }).trim(),
    body('bank_account_number').optional({ checkFalsy: true }).trim(),
    body('bank_ifsc')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 11, max: 11 })
      .withMessage('IFSC code must be 11 characters'),
    body('bank_branch').optional({ checkFalsy: true }).trim(),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/profile', authenticate, getProfile);

router.put(
  '/profile',
  authenticate,
  [
    body('name').optional({ checkFalsy: true }).trim(),
    body('village').optional({ checkFalsy: true }).trim(),
    body('district').optional({ checkFalsy: true }).trim(),
    body('aadhaar_last4')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage('Aadhaar last 4 digits must be exactly 4 numbers'),
    body('bank_name').optional({ checkFalsy: true }).trim(),
    body('bank_account_number').optional({ checkFalsy: true }).trim(),
    body('bank_ifsc')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 11, max: 11 })
      .withMessage('IFSC code must be 11 characters'),
    body('bank_branch').optional({ checkFalsy: true }).trim(),
  ],
  validate,
  updateProfile
);

router.post(
  '/forgot-password/request-otp',
  [
    body('phone')
      .trim()
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage('Valid 10-digit phone number required'),
  ],
  validate,
  requestForgotPasswordOTP
);

router.post(
  '/forgot-password/reset',
  [
    body('phone')
      .trim()
      .isLength({ min: 10, max: 10 })
      .isNumeric()
      .withMessage('Valid 10-digit phone number required'),
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP is required'),
    body('new_password')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  resetForgotPassword
);

module.exports = router;
