const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { v2: cloudinary } = require('cloudinary');

// ✅ CREATE Event
exports.createEvent = async (req, res) => {
  try {
    const bannerPath = req.file ? req.file.path : '';        // Cloudinary URL
    const bannerPublicId = req.file ? req.file.filename : ''; // Cloudinary public_id

    const newEvent = new Event({
      ...req.body,
      bannerPath,  // Changed from bannerUrl to bannerPath
      bannerPublicId,
      leftSeats: req.body.totalSeats,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Failed to create event', error });
  }
};

// ✅ GET all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

// ✅ GET event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error });
  }
};

// ✅ UPDATE Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const updatedData = req.body;

    // Recalculate seats if totalSeats changes
    if (updatedData.totalSeats !== undefined) {
      const regCount = await Registration.countDocuments({ eventId: req.params.id });
      updatedData.leftSeats = Math.max(0, updatedData.totalSeats - regCount);
    }

    // Handle banner removal
    if (req.body.removeBanner === 'true' && event.bannerPublicId) {
      await cloudinary.uploader.destroy(event.bannerPublicId);
      updatedData.bannerPath = '';
      updatedData.bannerPublicId = '';
    }

    // Handle new banner upload
    if (req.file) {
      // Delete old banner
      if (event.bannerPublicId) {
        await cloudinary.uploader.destroy(event.bannerPublicId);
      }
      updatedData.bannerPath = req.file.path;  // Changed from bannerUrl to bannerPath
      updatedData.bannerPublicId = req.file.filename;
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Failed to update event', error });
  }
};

// ✅ DELETE Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Delete banner from Cloudinary
    if (event.bannerPublicId) {
      await cloudinary.uploader.destroy(event.bannerPublicId);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event and banner deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Failed to delete event', error });
  }
};