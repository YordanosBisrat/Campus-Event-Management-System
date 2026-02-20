const Event = require('../models/Event');

// Add these imports if not already there
const Registration = require('../models/EventRegistration'); // assuming you have this model

// New analytics endpoint
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Events created per month (last 12 months)
    const eventsByMonth = await Event.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Top 5 events by registration count
    const topEvents = await Registration.aggregate([
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $lookup: { from: "events", localField: "_id", foreignField: "_id", as: "event" } },
      { $unwind: "$event" },
      { $project: { title: "$event.title", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Events by status (pie chart)
    const statusBreakdown = await Event.aggregate([
  {
    $group: {
      _id: { $ifNull: ["$status", "pending"] },
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      status: "$_id",
      count: 1,
      _id: 0
    }
  }
]);

    res.json({
      eventsByMonth,
      topEvents,
      statusBreakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};
// Create Event (now supports image)
exports.createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id,
      status: 'pending',
    };

    // If image was uploaded
    if (req.file) {
      eventData.image = `/uploads/events/${req.file.filename}`;
    }

    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to create event' });
  }
};

// Update Event (now supports replacing image)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    Object.assign(event, req.body);

    // If new image uploaded → replace old one
    if (req.file) {
      event.image = `/uploads/events/${req.file.filename}`;
    }

    await event.save();
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to update event' });
  }
};

// Student: Approved events only
// Get All Events (Students/Public)
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('createdBy', 'name email');
    res.json(events);
    console.log('Retrieved approved events:', events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Organizer: My events
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Single Event
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
// exports.updateEvent = async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) return res.status(404).json({ message: 'Event not found' });

//     if (event.createdBy.toString() !== req.user.id)
//       return res.status(403).json({ message: 'Not authorized' });

//     Object.assign(event, req.body);
//     await event.save();

//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Delete
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Admin — Get Pending Events
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — Approve Event
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: 'Event not found' });

    event.status = 'approved';
    await event.save();

    res.json({ message: 'Event approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin — Reject Event
exports.rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: 'Event not found' });

    event.status = 'rejected';
    await event.save();

    res.json({ message: 'Event rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Admin — Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
