const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Verify transporter configuration
const verifyTransporter = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
};

// Retry helper
const retry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

const sendConfirmationEmail = async (emailData) => {
  const { name, email, eventTitle, eventDate, message, time, location } = emailData;
  
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"QuadSync Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Registration Confirmed: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; }
                .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>You're Registered! 🎉</h1>
                    <p>Get ready for ${eventTitle}</p>
                </div>
                <div class="content">
                    <h2>Hello ${name},</h2>
                    <p>Your registration for <strong>${eventTitle}</strong> has been confirmed!</p>
                    
                    <h3>Event Details:</h3>
                    <p><strong>Date:</strong> ${eventDate}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Location:</strong> ${location}</p>
                    
                    ${message ? `<p><strong>Your Message:</strong> ${message}</p>` : ''}
                    
                    <p>We look forward to seeing you there!</p>
                </div>
                <div class="footer">
                    <p>QuadSync Events &copy; ${new Date().getFullYear()}</p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await retry(() => transporter.sendMail(mailOptions));
    console.log('✅ Confirmation email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendConfirmationEmail,
  verifyTransporter
};
