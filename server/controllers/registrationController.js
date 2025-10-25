const Registration = require('../models/Registration');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');
const Event = require('../models/Event');

// GET /api/registrations
exports.getAllRegistrants = async (req, res) => {
  try {
    const registrants = await Registration.find().populate('eventId', 'title date time location');
    res.json({
      success: true,
      data: registrants,
      count: registrants.length
    });
  } catch (error) {
    console.error('Get all registrants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch registrants', 
      error: error.message 
    });
  }
};

// GET /api/registrations/event/:eventId
exports.getRegistrantsByEvent = async (req, res) => {
  try {
    const registrants = await Registration.find({ eventId: req.params.eventId });
    res.json({
      success: true,
      data: registrants,
      count: registrants.length
    });
  } catch (error) {
    console.error('Get registrants by event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch event registrants', 
      error: error.message 
    });
  }
};

// POST /api/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, mobile, message, eventId } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !eventId) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, email, mobile, and event ID are required' 
      });
    }

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Check seat availability
    if (event.leftSeats <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No seats left for this event' 
      });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({ 
      email, 
      eventId 
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already registered for this event' 
      });
    }

    // Create and save registration
    const newRegistration = new Registration({
      name,
      email,
      mobile,
      message: message || '',
      eventId
    });

    const savedRegistration = await newRegistration.save();

    // Update available seats
    event.leftSeats -= 1;
    await event.save();

    // Send confirmation email (with error handling)
    let emailSent = false;
    try {
      await sendConfirmationEmail({
        name,
        email,
        message: message || '',
        eventTitle: event.title,
        eventDate: event.date,
        time: event.time,
        location: event.location,
      });
      emailSent = true;
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    // Prepare response
    const response = {
      success: true,
      message: 'Registration successful' + (emailSent ? ' and confirmation email sent' : ''),
      data: {
        registrationId: savedRegistration._id,
        name: savedRegistration.name,
        email: savedRegistration.email,
        eventTitle: event.title,
        eventDate: event.date,
        time: event.time,
        location: event.location,
        registeredAt: savedRegistration.registeredAt
      }
    };

    if (!emailSent) {
      response.warning = 'Registration completed but confirmation email could not be sent';
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// GET /api/register?eventId=xyz
exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ 
        success: false,
        message: 'Event ID is required' 
      });
    }

    const registrations = await Registration.find({ eventId });
    
    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Get registrations by event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching registrations', 
      error: error.message 
    });
  }
};

// DELETE /api/registrations/event/:eventId
exports.deleteAllRegistrants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Find the event first
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }

    // Get registrations count
    const registrations = await Registration.find({ eventId });
    const count = registrations.length;

    // Delete all registrations
    await Registration.deleteMany({ eventId });

    // Restore seats
    event.leftSeats += count;
    await event.save();

    res.json({ 
      success: true,
      message: `All ${count} registrants deleted`, 
      restoredSeats: count 
    });
  } catch (error) {
    console.error('Delete all registrants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete registrants', 
      error: error.message 
    });
  }
};

// DELETE /api/registrations/:id
exports.deleteSingleRegistrant = async (req, res) => {
  try {
    const registrant = await Registration.findById(req.params.id);
    if (!registrant) {
      return res.status(404).json({ 
        success: false,
        message: 'Registrant not found' 
      });
    }

    await Registration.findByIdAndDelete(req.params.id);

    // Restore seat
    const event = await Event.findById(registrant.eventId);
    if (event) {
      event.leftSeats += 1;
      await event.save();
    }

    res.json({ 
      success: true,
      message: 'Registrant deleted and seat restored',
      restoredSeats: 1
    });
  } catch (error) {
    console.error('Delete registrant error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete registrant', 
      error: error.message 
    });
  }
};
