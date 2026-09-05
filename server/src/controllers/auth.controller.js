const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const otpService = require('../services/otp.service');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/** POST /api/auth/request-otp */
const requestOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit phone number required' });
    }

    const result = await otpService.requestOTP(phone);

    if (!result.success) {
      return res.status(409).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      otp: result.otp,
      isSimulated: result.isSimulated,
      expiresIn: result.expiresIn,
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/verify-otp */
const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP required' });
    }

    const result = await otpService.verifyOTP(phone, otp);

    if (!result.valid) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      verified: true,
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/register */
const register = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      password,
      village,
      district,
      state,
      aadhaar_last4,
      otp,
      bank_name,
      bank_account_number,
      bank_ifsc,
      bank_branch,
    } = req.body;

    // Verify OTP was verified in previous step
    if (otp) {
      const isVerified = await otpService.isPhoneVerified(phone, otp);
      if (!isVerified) {
        return res.status(400).json({ error: 'OTP verification expired or not verified. Please verify OTP first.' });
      }
    } else {
      return res.status(400).json({ error: 'OTP verification required for registration' });
    }

    // Check if phone already registered
    const existing = await db('farmers').where({ phone }).first();
    if (existing) {
      return res.status(409).json({ error: 'Phone number already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [user] = await db('farmers')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        password_hash,
        village: village && village.trim() ? village.trim() : null,
        district: district && district.trim() ? district.trim() : null,
        state: state && state.trim() ? state.trim() : 'Maharashtra',
        aadhaar_last4: aadhaar_last4 && aadhaar_last4.trim() ? aadhaar_last4.trim() : null,
        bank_name: bank_name && bank_name.trim() ? bank_name.trim() : null,
        bank_account_number: bank_account_number && bank_account_number.trim() ? bank_account_number.trim() : null,
        bank_ifsc: bank_ifsc && bank_ifsc.trim() ? bank_ifsc.trim().toUpperCase() : null,
        bank_branch: bank_branch && bank_branch.trim() ? bank_branch.trim() : null,
      })
      .returning([
        'id',
        'name',
        'phone',
        'village',
        'district',
        'state',
        'aadhaar_last4',
        'bank_name',
        'bank_account_number',
        'bank_ifsc',
        'bank_branch',
        'role',
        'created_at',
      ]);

    // Clean up OTP record now that user is registered
    await otpService.cleanupOTP(phone);

    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const user = await db('farmers').where({ phone }).first();
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        village: user.village,
        district: user.district,
        state: user.state,
        aadhaar_last4: user.aadhaar_last4,
        bank_name: user.bank_name,
        bank_account_number: user.bank_account_number,
        bank_ifsc: user.bank_ifsc,
        bank_branch: user.bank_branch,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/profile */
const getProfile = async (req, res, next) => {
  try {
    const user = await db('farmers')
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete user.password_hash;

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/auth/profile */
const updateProfile = async (req, res, next) => {
  try {
    const { name, village, district, aadhaar_last4, bank_name, bank_account_number, bank_ifsc, bank_branch } = req.body;

    const [updatedUser] = await db('farmers')
      .where({ id: req.user.id })
      .update({
        name: name !== undefined ? (name.trim() || null) : undefined,
        village: village !== undefined ? (village.trim() || null) : undefined,
        district: district !== undefined ? (district.trim() || null) : undefined,
        aadhaar_last4: aadhaar_last4 !== undefined ? (aadhaar_last4.trim() || null) : undefined,
        bank_name: bank_name !== undefined ? (bank_name.trim() || null) : undefined,
        bank_account_number: bank_account_number !== undefined ? (bank_account_number.trim() || null) : undefined,
        bank_ifsc: bank_ifsc !== undefined ? (bank_ifsc.trim() ? bank_ifsc.trim().toUpperCase() : null) : undefined,
        bank_branch: bank_branch !== undefined ? (bank_branch.trim() || null) : undefined,
      })
      .returning([
        'id',
        'name',
        'phone',
        'village',
        'district',
        'state',
        'aadhaar_last4',
        'bank_name',
        'bank_account_number',
        'bank_ifsc',
        'bank_branch',
        'role',
      ]);

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestOTP, verifyOTP, register, login, getProfile, updateProfile };
