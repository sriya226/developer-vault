const router = require('express').Router();
const { updateProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');

router.put('/profile', protect, updateProfile);

module.exports = router;
