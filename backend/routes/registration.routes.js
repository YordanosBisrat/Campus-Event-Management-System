const express = require('express');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const {
  registerForEvent,
  getMyRegistrations,
} = require('../controllers/registration.controller');

const router = express.Router();

router.post('/:eventId', auth, role('student'), registerForEvent);
router.get('/me', auth, getMyRegistrations);

module.exports = router;
