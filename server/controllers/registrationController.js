const Registration = require('../models/Registration');
const sendConfirmationEmail = require('../utils/sendConfirmationEmail');
const Event = require('../models/Event');

// Simple in-memory queue for emails
const emailQueue = [];
let isProcessing = false;

const processEmailQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;
  
  isProcessing = true;
  console.log(`🔄 Processing email queue with ${emailQueue.length} emails`);
  
  while (emailQueue.length > 0) {
    const emailData = emailQueue.shift();
    try {
      await sendConfirmationEmail(emailData);
      console.log('✅ Email sent successfully to:', emailData.email);
    } catch (error) {
      console.error('❌ Failed to send email to:', emailData.email, error.message);
      // Store failed emails for retry (you could implement retry logic here)
    }
  }
  
  isProcessing = false;
  console.log('✅ Email queue processing completed');
};

// GET /api/registrations
exports.getAllRegistrants = async (req, res) => {
  try {
    const registrants = await Registration.find().populate('eventId', 'title');
    res.json(registrants);
  } catch (error) {
    console.error('❌ Failed to fetch registrants:', error);
    res.status(500).json({ message: 'Failed to fetch registrants', error: error.message });
  }
};

// GET /api/registrations/event/:eventId
exports.getRegistrantsByEvent = async (req, res) => {
  try {
    const registrants = await Registration.find({ eventId: req.params.eventId });
    res.json(registrants);
  } catch (error) {
    console.error('❌ Failed to fetch event registrants:', error);
    res.status(500).json({ message: 'Failed to fetch event registrants', error: error.message });
  }
};

// POST /api/register - OPTIMIZED VERSION
exports.registerUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting registration process for event:', req.body.eventId);
    
    const event = await Event.findById(req.body.eventId);
    if (!event) {
      console.log('❌ Event not found:', req.body.eventId);
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.leftSeats <= 0) {
      console.log('❌ No seats left for event:', event.title);
      return res.status(400).json({ message: 'No seats left for this event' });
    }

    // Check for duplicate registration
    const existingRegistration = await Registration.findOne({
      eventId: req.body.eventId,
      email: req.body.email
    });
    
    if (existingRegistration) {
      console.log('❌ Duplicate registration attempt:', req.body.email);
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Save registration
    const newRegistration = new Registration(req.body);
    const saved = await newRegistration.save();
    console.log('✅ Registration saved to database');

    // Update leftSeats
    event.leftSeats -= 1;
    await event.save();
    console.log('✅ Seat count updated');

    // ✅ NON-BLOCKING email - add to queue and respond immediately
    const emailData = {
      name: req.body.name,
      email: req.body.email,
      message: req.body.message || '',
      eventTitle: event.title || 'Your Event',
      eventDate: event.date,
      time: event.time,
      location: event.location,
    };
    
    emailQueue.push(emailData);
    console.log('📧 Email added to queue for:', req.body.email);

    // Process email queue in background (non-blocking)
    processEmailQueue().catch(err => {
      console.error('❌ Email queue processing error:', err);
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Registration completed in ${duration}ms`);
    
    // ✅ IMMEDIATE response
    res.status(201).json({
      ...saved.toObject(),
      message: 'Registration successful! Confirmation email will be sent shortly.'
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Registration failed after ${duration}ms:`, error);
    res.status(400).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
};

// GET /api/register?eventId=xyz
exports.getRegistrationsByEvent = async (req, res) => {
  try {
    const { eventId } = req.query;
    const registrations = await Registration.find({ eventId });
    res.json(registrations);
  } catch (error) {
    console.error('❌ Error fetching registrations:', error);
    res.status(500).json({ message: 'Error fetching registrations', error: error.message });
  }
};

// DELETE /api/registrations/event/:eventId
exports.deleteAllRegistrants = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const registrations = await Registration.find({ eventId });
    const count = registrations.length;

    await Registration.deleteMany({ eventId });

    const event = await Event.findById(eventId);
    if (event) {
      event.leftSeats += count;
      await event.save();
    }

    res.json({ message: 'All registrants deleted', restoredSeats: count });
  } catch (error) {
    console.error('❌ Failed to delete registrants:', error);
    res.status(500).json({ message: 'Failed to delete registrants', error: error.message });
  }
};

// DELETE /api/registrations/:id
exports.deleteSingleRegistrant = async (req, res) => {
  try {
    const registrant = await Registration.findById(req.params.id);
    if (!registrant) return res.status(404).json({ message: 'Registrant not found' });

    await Registration.findByIdAndDelete(req.params.id);

    const event = await Event.findById(registrant.eventId);
    if (event) {
      event.leftSeats += 1;
      await event.save();
    }

    res.json({ message: 'Registrant deleted and seat restored' });
  } catch (error) {
    console.error('❌ Failed to delete registrant:', error);
    res.status(500).json({ message: 'Failed to delete registrant', error: error.message });
  }
};
