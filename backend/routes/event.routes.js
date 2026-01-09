const express = require('express');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllEvents,
} = require('../controllers/event.controller');

const router = express.Router();

/* =========================
   ORGANIZER
   ========================= */

// organizer: see own events
router.get('/my', auth, role('organizer'), getMyEvents);

// organizer: create event (pending by default)
router.post('/', auth, role('organizer'), createEvent);

// organizer: update/delete own event
router.put('/:id', auth, role('organizer'), updateEvent);
router.delete('/:id', auth, role('organizer'), deleteEvent);

/* =========================
   ADMIN
   ========================= */

// admin: view pending events
router.get('/admin/pending', auth, role('admin'), getPendingEvents);

// admin: approve event
router.patch('/admin/approve/:id', auth, role('admin'), approveEvent);

// admin: reject event
router.patch('/admin/reject/:id', auth, role('admin'), rejectEvent);

// admin: view all events
router.get('/admin/all', auth, role('admin'), getAllEvents);


/* =========================
   PUBLIC / STUDENT
   ========================= */

// students: only approved events
router.get('/', getEvents);

// single event
router.get('/:id', getEventById);

module.exports = router;
