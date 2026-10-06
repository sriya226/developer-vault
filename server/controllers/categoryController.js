const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { CATEGORIES, str } = require('../utils/constants');
const { limitsFor, planNameFor, HARD_MAX_CUSTOM_CATEGORIES } = require('../utils/plans');

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 .+#&_-]{1,29}$/;

// Built-in + custom categories with the user's resource count for each.
const buildList = async (user) => {
  const rows = await Bookmark.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(rows.map((r) => [r._id, r.count]));
  const custom = user.customCategories;
  const known = new Set([...CATEGORIES, ...custom]);
  // Categories still in use but no longer registered (e.g. after a plan expired) stay visible.
  const orphans = rows.map((r) => r._id).filter((n) => n && !known.has(n));
  const item = (name, isCustom) => ({ name, count: counts[name] || 0, custom: isCustom });
  return {
    categories: [...CATEGORIES.map((n) => item(n, false)), ...custom.map((n) => item(n, true)), ...orphans.map((n) => item(n, true))],
    customCategories: custom,
  };
};

// GET /api/categories
exports.list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await buildList(req.user) });
});

// POST /api/categories  { name }   (Pro / Team)
exports.create = asyncHandler(async (req, res) => {
  const name = str(req.body.name).replace(/\s+/g, ' ').trim();
  const { maxCustomCategories } = limitsFor(req.user);
  if (maxCustomCategories === 0) {
    throw httpError(403, `Custom categories are not included in the ${planNameFor(req.user)} plan. Upgrade to Pro or Team.`, 'PLAN_LIMIT');
  }
  if (!NAME_RE.test(name)) throw httpError(400, 'Category names must be 2 to 30 characters: letters, numbers, spaces and - _ . + # &');
  const exists = [...CATEGORIES, ...req.user.customCategories].some((c) => c.toLowerCase() === name.toLowerCase());
  if (exists) throw httpError(409, 'That category already exists.');
  const cap = maxCustomCategories ?? HARD_MAX_CUSTOM_CATEGORIES;
  if (req.user.customCategories.length >= cap) throw httpError(403, `You can have up to ${cap} custom categories.`, 'PLAN_LIMIT');

  req.user.customCategories.push(name);
  await req.user.save();
  res.status(201).json({ success: true, data: await buildList(req.user) });
});

// DELETE /api/categories/:name  (resources in it move to "Other")
exports.remove = asyncHandler(async (req, res) => {
  const name = str(req.params.name);
  if (CATEGORIES.includes(name)) throw httpError(400, 'Built-in categories cannot be deleted.');
  await Bookmark.updateMany({ userId: req.user._id, category: name }, { $set: { category: 'Other' } }, { timestamps: false });
  req.user.customCategories = req.user.customCategories.filter((c) => c !== name);
  await req.user.save();
  res.json({ success: true, data: await buildList(req.user) });
});
