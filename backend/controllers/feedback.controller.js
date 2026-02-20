const Feedback = require('../models/Feedback');
const Event = require('../models/Event');

// Submit feedback (student only)
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const eventId = req.params.eventId;
    const userId = req.user.id; // from auth middleware

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if event has passed
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({ message: 'Feedback can only be given for passed events' });
    }

    // Check if user registered for this event (assume you have Registration model)
    const Registration = require('../models/EventRegistration');
    const registration = await Registration.findOne({ event: eventId, user: userId });
    if (!registration) return res.status(403).json({ message: 'You must be registered for this event to give feedback' });

    // Check if already gave feedback
    const existing = await Feedback.findOne({ event: eventId, user: userId });
    if (existing) return res.status(400).json({ message: 'You have already given feedback for this event' });

    const feedback = new Feedback({
      event: eventId,
      user: userId,
      rating,
      comment
    });

    await feedback.save();

    // Update event average rating
    const feedbacks = await Feedback.find({ event: eventId });
    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    event.averageRating = feedbacks.length ? totalRating / feedbacks.length : 0;
    event.feedbackCount = feedbacks.length;
    await event.save();

    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback for an event (organizer only)
exports.getEventFeedback = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);

    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized to view this event\'s feedback' });

    const feedbacks = await Feedback.find({ event: eventId })
      .populate('user', 'name') // show user's name
      .select('rating comment createdAt');

    res.json({
      averageRating: event.averageRating,
      feedbackCount: event.feedbackCount,
      feedbacks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};