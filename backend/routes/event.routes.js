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
   getAnalytics,
} = require('../controllers/event.controller');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `event-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'));
  },
});

const router = express.Router();

// ────────────────────────────────────────────────
//  IMPORTANT: Static routes must come BEFORE dynamic routes
// ────────────────────────────────────────────────

// Organizer: my events (this must be before /:id)
router.get('/my', auth, role('organizer'), getMyEvents);

// Public / Student: all approved events
router.get('/', getEvents);

router.get('/analytics', auth, role('admin'), getAnalytics);


// ────────────────────────────────────────────────
//  Dynamic routes (/:id) come AFTER specific routes
// ────────────────────────────────────────────────
router.get('/:id', getEventById);

// ────────────────────────────────────────────────
//  Organizer routes
// ────────────────────────────────────────────────
router.post('/', auth, role('organizer'), upload.single('image'), createEvent);
router.put('/:id', auth, role('organizer'), upload.single('image'), updateEvent);
router.delete('/:id', auth, role('organizer'), deleteEvent);

// ────────────────────────────────────────────────
//  Admin routes
// ────────────────────────────────────────────────
router.get('/admin/pending', auth, role('admin'), getPendingEvents);
router.patch('/admin/approve/:id', auth, role('admin'), approveEvent);
router.patch('/admin/reject/:id', auth, role('admin'), rejectEvent);
router.get('/admin/all', auth, role('admin'), getAllEvents);

module.exports = router;