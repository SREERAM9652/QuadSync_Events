const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import and verify email service
const { verifyTransporter } = require('./utils/emailService');

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/register', require('./routes/register'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/registrations', require('./routes/registration'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));

// Test email configuration endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    const isVerified = await verifyTransporter();
    res.json({ 
      success: isVerified, 
      message: isVerified ? 'Email configuration is correct' : 'Email configuration failed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Email test failed',
      error: error.message 
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  
  // Verify email configuration on startup
  await verifyTransporter();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
