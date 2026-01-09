const User = require('../models/User');
const Event = require('../models/Event');

// Get all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// Update user role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  const allowed = ['admin', 'organizer', 'student'];

  if (!allowed.includes(role))
    return res.status(400).json({ message: 'Invalid role' });

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { role },
    { new: true }
  ).select('-password');

  if (!user)
    return res.status(404).json({ message: 'User not found' });

  res.json(user);
};

// Admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const approvedEvents = await Event.countDocuments({ status: 'approved' });
    const rejectedEvents = await Event.countDocuments({ status: 'rejected' });

    res.json({
      totalUsers,
      totalEvents,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load admin stats' });
  }
};
