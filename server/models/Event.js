const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  leftSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  tags: { type: String },
  location: { type: String, required: true },
  description: { type: String },
  highlights: { type: String },
  organizer: { type: String },

  // ✅ Use bannerPath instead of bannerUrl to match frontend
  bannerPath: { type: String },       // Cloudinary URL
  bannerPublicId: { type: String },   // Cloudinary public_id for deletion

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);