const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Basic input validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required: name, email, password, role' });
    }

    // 2. Validate email format (basic regex check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // 3. Role-specific email domain validation
    if (role === 'student' && !email.toLowerCase().endsWith('@aau.edu.et')) {
      return res.status(400).json({
        message: 'Students must register using an official AAU email address (@aau.edu.et)'
      });
    }

    // Optional: You can add more restrictions for organizer if needed
    // e.g. if (role === 'organizer' && !email.endsWith('@some-domain.com')) { ... }

    // 4. Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 5. Validate role is allowed
    const allowedRoles = ['student', 'organizer'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Allowed: student or organizer' });
    }

    // 6. Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role // will be 'student' or 'organizer'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
