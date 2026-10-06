const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { CATEGORIES, RESOURCE_TYPES, str } = require('../utils/constants');
const { limitsFor, planNameFor, HARD_MAX_TAGS } = require('../utils/plans');
const { getMetadata, normalizeUrl, safeAssetUrl } = require('../services/metadataService');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds a bookmark by id, ALWAYS scoped to the logged-in user.
const findOwned = async (req) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw httpError(404, 'Resource not found.');
  const bookmark = await Bookmark.findOne({ _id: id, userId: req.user._id });
  if (!bookmark) throw httpError(404, 'Resource not found.');
  return bookmark;
};

const normalizeTags = (input) => {
  const list = Array.isArray(input) ? input : str(input).split(',');
  const tags = list
    .map((t) => str(t).toLowerCase().replace(/^#+/, '').replace(/[^a-z0-9+#._-]/g, '').slice(0, 30))
    .filter(Boolean);
  return [...new Set(tags)].slice(0, HARD_MAX_TAGS);
};

// Validates and whitelists writable fields, applying the user's plan limits.
// existing: the bookmark being edited (so already-saved tags/categories are never blocked after a downgrade).
const buildPayload = (body, { partial, user, existing }) => {
  const out = {};
  if (!partial || body.url !== undefined) {
    out.url = normalizeUrl(body.url);
    if (!body.website) out.website = new URL(out.url).hostname.replace(/^www\./, '');
  }
  if (body.title !== undefined || !partial) {
    const hostFallback = out.url ? new URL(out.url).hostname.replace(/^www\./, '') : '';
    out.title = str(body.title).slice(0, 200) || hostFallback;
    if (!out.title) throw httpError(400, 'Title cannot be empty.');
  }
  if (body.description !== undefined) {
    if (str(body.description).length > 1000) throw httpError(400, 'Description must be 1000 characters or fewer.');
    out.description = str(body.description);
  }
  if (body.website !== undefined && body.website) out.website = str(body.website).slice(0, 200);
  if (body.previewImage !== undefined) out.previewImage = safeAssetUrl(body.previewImage);
  if (body.favicon !== undefined) out.favicon = safeAssetUrl(body.favicon);
  if (body.category !== undefined) {
    const allowed = [...CATEGORIES, ...user.customCategories];
    if (!allowed.includes(body.category) && body.category !== existing?.category) throw httpError(400, 'Please choose a valid category.');
    out.category = body.category;
  }
  if (body.resourceType !== undefined) {
    if (!RESOURCE_TYPES.includes(body.resourceType)) throw httpError(400, 'Please choose a valid resource type.');
    out.resourceType = body.resourceType;
  }
  if (body.tags !== undefined) {
    out.tags = normalizeTags(body.tags);
    const max = limitsFor(user).maxTagsPerResource;
    const alreadyHad = existing?.tags?.length || 0;
    if (max !== null && out.tags.length > max && out.tags.length > alreadyHad) {
      throw httpError(403, `The ${planNameFor(user)} plan allows up to ${max} tags per resource. Upgrade to Pro for unlimited tags.`, 'PLAN_LIMIT');
    }
  }
  return out;
};

// GET /api/bookmarks?search=&category=&resourceType=&favorite=&sort=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const q = req.query;
  const filter = { userId: req.user._id };

  const search = str(q.search).replace(/^#/, '').slice(0, 100);
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { website: rx }, { tags: rx }];
  }
  const category = str(q.category).slice(0, 40);
  if (category) filter.category = category; // always a plain string; scoped by userId anyway
  if (RESOURCE_TYPES.includes(q.resourceType)) filter.resourceType = q.resourceType;
  if (q.favorite === 'true') filter.favorite = true;

  const sorts = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    az: { title: 1, _id: 1 },
    updated: { updatedAt: -1, _id: -1 },
  };
  const sort = sorts[q.sort] || sorts.newest;
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 12, 1), 50);
  const page = Math.max(parseInt(q.page, 10) || 1, 1);

  const [items, total] = await Promise.all([
    Bookmark.find(filter).collation({ locale: 'en', strength: 2 }).sort(sort).skip((page - 1) * limit).limit(limit),
    Bookmark.countDocuments(filter),
  ]);
  res.json({ success: true, data: { items, total, page, limit, pages: Math.max(Math.ceil(total / limit), 1) } });
});

// GET /api/bookmarks/stats
exports.stats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [total, favorites, categories, recent] = await Promise.all([
    Bookmark.countDocuments({ userId }),
    Bookmark.countDocuments({ userId, favorite: true }),
    Bookmark.distinct('category', { userId }),
    Bookmark.countDocuments({ userId, createdAt: { $gte: weekAgo } }),
  ]);
  res.json({ success: true, data: { total, favorites, categories: categories.length, recent } });
});

// GET /api/bookmarks/:id
exports.getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { bookmark: await findOwned(req) } });
});

// POST /api/bookmarks
exports.create = asyncHandler(async (req, res) => {
  const maxResources = limitsFor(req.user).maxResources;
  if (maxResources !== null) {
    const count = await Bookmark.countDocuments({ userId: req.user._id });
    if (count >= maxResources) {
      throw httpError(403, `The ${planNameFor(req.user)} plan is limited to ${maxResources} resources. Upgrade to save more.`, 'PLAN_LIMIT');
    }
  }
  const payload = buildPayload(req.body, { partial: false, user: req.user });
  const bookmark = await Bookmark.create({ ...payload, userId: req.user._id });
  res.status(201).json({ success: true, data: { bookmark } });
});

// PUT /api/bookmarks/:id
exports.update = asyncHandler(async (req, res) => {
  const bookmark = await findOwned(req);
  bookmark.set(buildPayload(req.body, { partial: true, user: req.user, existing: bookmark }));
  await bookmark.save();
  res.json({ success: true, data: { bookmark } });
});

// DELETE /api/bookmarks/:id
exports.remove = asyncHandler(async (req, res) => {
  const bookmark = await findOwned(req);
  await bookmark.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
});

// PATCH /api/bookmarks/:id/favorite  (optional body: { favorite: boolean })
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const bookmark = await findOwned(req);
  bookmark.favorite = typeof req.body.favorite === 'boolean' ? req.body.favorite : !bookmark.favorite;
  await bookmark.save({ timestamps: false }); // favoriting should not change "recently updated"
  res.json({ success: true, data: { bookmark } });
});

// POST /api/bookmarks/metadata
exports.metadata = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await getMetadata(req.body.url) });
});

// GET /api/bookmarks/export -> bookmarks.json (only the current user's data)
exports.exportAll = asyncHandler(async (req, res) => {
  const docs = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  const bookmarks = docs.map(({ _id, userId, __v, ...rest }) => ({ id: _id.toString(), ...rest }));
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="bookmarks.json"');
  res.send(JSON.stringify({ exportedAt: new Date().toISOString(), count: bookmarks.length, bookmarks }, null, 2));
});
