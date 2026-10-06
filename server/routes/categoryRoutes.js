const router = require('express').Router();
const { list, create, remove } = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(list).post(create);
router.delete('/:name', remove);

module.exports = router;
