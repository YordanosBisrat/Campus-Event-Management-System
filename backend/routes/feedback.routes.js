const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const auth = require('../middleware/auth.middleware'); // your auth middleware
const role = require('../middleware/role.middleware'); // if you have role middleware

// Submit feedback (student only)
router.post('/feedback/:eventId', auth, role('student'), feedbackController.submitFeedback);

// Get event feedback (organizer only)
router.get('/feedback/event/:eventId', auth, role('organizer'), feedbackController.getEventFeedback);

module.exports = router;