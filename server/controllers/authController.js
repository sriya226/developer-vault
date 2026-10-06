const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { EMAIL_RE, str } = require('../utils/constants');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const name = str(req.body.name);
  const email = str(req.body.email).toLowerCase();
  const password = str(req.body.password);
  const confirmPassword = req.body.confirmPassword;

  if (name.length < 2 || name.length > 60) throw httpError(400, 'Name must be between 2 and 60 characters.');
  if (!EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 72) throw httpError(400, 'Password must be 8 to 72 characters long.');
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) throw httpError(400, 'Password must include at least one letter and one number.');
  if (confirmPassword !== undefined && confirmPassword !== password) throw httpError(400, 'Passwords do not match.');

  if (await User.exists({ email })) throw httpError(409, 'An account with this email already exists.');

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  res.status(201).json({ success: true, data: { user, token: signToken(user._id) } });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = str(req.body.password);
  if (!email || !password) throw httpError(400, 'Please enter your email and password.');

  const user = await User.findOne({ email }).select('+password');
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw httpError(401, 'Invalid email or password.');

  res.json({ success: true, data: { user, token: signToken(user._id) } });
});

// GET /api/auth/me
exports.me = (req, res) => res.json({ success: true, data: { user: req.user } });
