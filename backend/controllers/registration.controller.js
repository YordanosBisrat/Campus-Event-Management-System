const EventRegistration = require('../models/EventRegistration');

exports.registerForEvent = async (req, res) => {
  try {
    const registration = await EventRegistration.create({
      event: req.params.eventId,
      user: req.user.id,
    });
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Already registered' });
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  const registrations = await EventRegistration.find({ user: req.user.id })
    .populate('event');
  res.json(registrations);
};
