// seedAdmin.js (CommonJS)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Admin = require('./models/Admin'); // Adjust path if needed

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await Admin.findOne({ username: 'superadmin' });
    if (existingAdmin) {
      console.log('Admin already exists. Exiting...');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('SuperSecret123', 10);

    const admin = new Admin({
      name: 'Super Admin',
      username: 'superadmin',
      email: 'admin@example.com',
      password: '$2a$10$5rM.1d6Sx6P2Uq7FzXbU8.1kLh6GnXv4sWn1Zy5uQf8b1oR3H9yQK',
      role: 'admin',
    });

    await admin.save();
    console.log('Super Admin created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
