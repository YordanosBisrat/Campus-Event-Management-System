const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    image: {
      type: String,
      default: null, // optional
      // Example: "/uploads/events/123abc.jpg"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    averageRating: { type: Number, default: 0 },
    feedbackCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Optional: virtual for easier frontend usage
eventSchema.virtual('imageUrl').get(function () {
  if (!this.image) return null;
  return `${process.env.BASE_URL || 'http://localhost:5000'}${this.image}`;
});

module.exports = mongoose.model('Event', eventSchema);