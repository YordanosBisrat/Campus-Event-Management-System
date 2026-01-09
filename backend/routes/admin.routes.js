const express = require('express');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const {
  getAllUsers,
  updateUserRole,
  getAdminStats,
} = require('../controllers/admin.controller');

const router = express.Router();

router.get('/users', auth, role('admin'), getAllUsers);
router.put('/users/:userId/role', auth, role('admin'), updateUserRole);
router.get('/stats', auth, role('admin'), getAdminStats);


module.exports = router;
