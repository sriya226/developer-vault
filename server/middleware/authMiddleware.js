const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// Verifies the Bearer token and attaches the logged-in user to req.user.
module.exports = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Please log in to continue.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) throw httpError(401, 'Your session is no longer valid. Please log in again.');
  req.user = user;
  next();
});
