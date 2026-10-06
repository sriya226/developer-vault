const router = require('express').Router();
const { status, createOrder, verify } = require('../controllers/billingController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.get('/status', status);
router.post('/order', createOrder);
router.post('/verify', verify);

module.exports = router;
