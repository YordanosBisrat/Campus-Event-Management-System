const express = require('express');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const {
  getAllUsers,
  updateUserRole,
  getAdminStats,
} = require('../controllers/admin.controller');

const{
  getAnalytics
}= require('../controllers/event.controller');

const router = express.Router();

router.get('/users', auth, role('admin'), getAllUsers);
router.put('/users/:userId/role', auth, role('admin'), updateUserRole);
router.get('/stats', auth, role('admin'), getAdminStats);
router.get('/events/analytics', auth, role('admin'), getAnalytics);


module.exports = router;
