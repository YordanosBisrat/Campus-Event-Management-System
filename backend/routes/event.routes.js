const express = require('express');
const auth = require('../middleware/auth.middleware');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/event.controller');

const router = express.Router();

router.post('/', auth, createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);

module.exports = router;

const role = require('../middleware/role.middleware');

// only admin & organizer can create
router.post('/', auth, role('admin', 'organizer'), createEvent);

// only admin & organizer can update/delete
router.put('/:id', auth, role('admin', 'organizer'), updateEvent);
router.delete('/:id', auth, role('admin', 'organizer'), deleteEvent);
