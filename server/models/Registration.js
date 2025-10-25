const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: { 
    type: String, 
    required: [true, 'Mobile number is required'],
    trim: true
  },
  message: { 
    type: String, 
    default: '',
    maxlength: 500 
  },
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: [true, 'Event ID is required'] 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
});

// Prevent duplicate registrations for same event and email
registrationSchema.index({ email: 1, eventId: 1 }, { unique: true });

// For faster queries by event
registrationSchema.index({ eventId: 1 });

// Virtual for formatted registration date
registrationSchema.virtual('formattedDate').get(function() {
  return this.registeredAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Ensure virtual fields are serialized
registrationSchema.set('toJSON', { virtuals: true });

// ✅ Prevent OverwriteModelError in watch mode
module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
