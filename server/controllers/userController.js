const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { EMAIL_RE, str } = require('../utils/constants');

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const name = str(req.body.name);
  const email = str(req.body.email).toLowerCase();
  if (name.length < 2 || name.length > 60) throw httpError(400, 'Name must be between 2 and 60 characters.');
  if (!EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address.');

  if (await User.exists({ email, _id: { $ne: req.user._id } })) {
    throw httpError(409, 'Another account already uses this email.');
  }
  req.user.name = name;
  req.user.email = email;
  await req.user.save();
  res.json({ success: true, data: { user: req.user } });
});
