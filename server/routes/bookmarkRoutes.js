const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/bookmarkController');
const protect = require('../middleware/authMiddleware');

const metadataLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many metadata requests. Please wait a moment.' },
});

router.use(protect); // every bookmark route requires a logged-in user

router.route('/').get(c.list).post(c.create);
// Fixed paths must be declared before "/:id"
router.get('/stats', c.stats);
router.get('/export', c.exportAll);
router.post('/metadata', metadataLimiter, c.metadata);
router.route('/:id').get(c.getOne).put(c.update).delete(c.remove);
router.patch('/:id/favorite', c.toggleFavorite);

module.exports = router;
