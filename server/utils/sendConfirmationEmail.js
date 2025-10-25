const nodemailer = require('nodemailer');

// Retry helper for transient failures
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

const sendConfirmationEmail = async ({ name, email, eventTitle, eventDate, message, time, location }) => {
  try {
    // Create transporter with explicit Gmail SMTP config
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS, // App password
      },
      tls: {
        rejectUnauthorized: false, // Optional fallback
      },
    });

    // Modern email template with enhanced styling
    const mailOptions = {
      from: `"QuadSync Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 Registration Confirmed: ${eventTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Confirmation</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #374151;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 50px 40px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 50px 40px;
        }
        
        .greeting {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 30px;
            font-weight: 600;
        }
        
        .welcome-text {
            font-size: 17px;
            color: #6b7280;
            margin-bottom: 35px;
            line-height: 1.7;
        }
        
        .event-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 16px;
            padding: 30px;
            color: white;
            margin: 30px 0;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .event-card h2 {
            font-size: 24px;
            margin-bottom: 25px;
            font-weight: 700;
            text-align: center;
        }
        
        .event-details {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 16px;
            padding: 12px 0;
        }
        
        .detail-item .icon-container {
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        
        .detail-item .icon {
            font-size: 22px;
            text-align: center;
        }
        
        .detail-content {
            flex: 1;
        }
        
        .detail-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 4px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: 600;
        }
        
        .message-section {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }
        
        .message-section h3 {
            color: #1e40af;
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .message-text {
            color: #4b5563;
            font-style: italic;
            line-height: 1.6;
        }
        
        .next-steps {
            background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            color: white;
        }
        
        .next-steps h3 {
            font-size: 20px;
            margin-bottom: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .next-steps ul {
            list-style: none;
            padding: 0;
        }
        
        .next-steps li {
            padding: 10px 0;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .next-steps li:before {
            content: "✓";
            background: rgba(255, 255, 255, 0.2);
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            flex-shrink: 0;
        }
        
        .social-section {
            text-align: center;
            margin: 40px 0 30px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 16px;
        }
        
        .social-section h3 {
            color: #374151;
            margin-bottom: 10px;
            font-size: 20px;
            font-weight: 600;
        }
        
        .social-subtitle {
            color: #6b7280;
            margin-bottom: 25px;
            font-size: 15px;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .social-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 14px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        
        .social-link:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        
        .social-link.linkedin { background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%); }
        .social-link.facebook { background: linear-gradient(135deg, #4267B2 0%, #5b7bd5 100%); }
        .social-link.instagram { background: linear-gradient(135deg, #833AB4 0%, #C13584 50%, #E1306C 100%); }
        .social-link.twitter { background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%); }
        
        .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 40px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .footer-links {
            margin: 20px 0;
        }
        
        .footer-links a {
            color: #d1d5db;
            text-decoration: none;
            margin: 0 12px;
            font-size: 14px;
            transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
            color: #ffffff;
        }
        
        .disclaimer {
            font-size: 12px;
            color: #6b7280;
            margin-top: 25px;
            line-height: 1.5;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .header {
                padding: 40px 25px;
            }
            
            .header h1 {
                font-size: 28px;
            }
            
            .content {
                padding: 40px 25px;
            }
            
            .event-card, .next-steps {
                padding: 25px;
            }
            
            .detail-item {
                gap: 15px;
            }
            
            .detail-item .icon-container {
                width: 45px;
                height: 45px;
            }
            
            .social-links {
                gap: 10px;
            }
            
            .social-link {
                width: 46px;
                height: 46px;
                border-radius: 12px;
            }
            
            .social-section {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            <h1>You're Registered! 🎉</h1>
            <p>Get ready for an amazing experience</p>
        </div>
        
        <!-- Content Section -->
        <div class="content">
            <div class="greeting">
                Hello <strong>${name}</strong>,
            </div>
            
            <p class="welcome-text">
                We're absolutely thrilled to have you join us for <strong>${eventTitle}</strong>! 
                Your registration has been confirmed, and we can't wait to welcome you to this incredible event.
            </p>
            
            <!-- Event Details Card -->
            <div class="event-card">
                <h2>${eventTitle}</h2>
                <div class="event-details">
                    <div class="detail-item">
                        <div class="icon-container">
                            <span class="icon">📅</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">DATE</div>
                            <div class="detail-value">${eventDate}</div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="icon-container">
                            <span class="icon">⏰</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">TIME</div>
                            <div class="detail-value">${time}</div>
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="icon-container">
                            <span class="icon">📍</span>
                        </div>
                        <div class="detail-content">
                            <div class="detail-label">LOCATION</div>
                            <div class="detail-value">${location}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Personal Message Section -->
            ${message ? `
            <div class="message-section">
                <h3>📝 Your Note to Us</h3>
                <p class="message-text">"${message}"</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">We've noted your message and will keep it in mind!</p>
            </div>
            ` : ''}
            
            <!-- Next Steps -->
            <div class="next-steps">
                <h3>✅ What's Next?</h3>
                <ul>
                    <li>Save the date and set a reminder</li>
                    <li>Check your email for event updates</li>
                    <li>Arrive 15 minutes early for smooth check-in</li>
                    <li>Bring your enthusiasm and questions!</li>
                </ul>
            </div>
            
            <!-- Social Links -->
            <div class="social-section">
                <h3>Stay Connected</h3>
                <p class="social-subtitle">Follow us for updates and more exciting events</p>
                <div class="social-links">
                    <a href="https://www.linkedin.com/" class="social-link linkedin" title="LinkedIn">in</a>
                    <a href="https://facebook.com/" class="social-link facebook" title="Facebook">f</a>
                    <a href="https://instagram.com/" class="social-link instagram" title="Instagram">📷</a>
                    <a href="https://twitter.com/" class="social-link twitter" title="Twitter">𝕏</a>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong style="color: #ffffff; font-size: 16px;">QuadSync Events</strong></p>
            <p>Creating memorable experiences through innovation</p>
            
            <div class="footer-links">
                <a href="${process.env.FRONTEND_URL || 'https://youreventplatform.com'}">Website</a>
                <a href="${process.env.FRONTEND_URL || 'https://youreventplatform.com'}/contact">Contact</a>
                <a href="${process.env.FRONTEND_URL || 'https://youreventplatform.com'}/faq">FAQ</a>
                <a href="${process.env.FRONTEND_URL || 'https://youreventplatform.com'}/privacy">Privacy</a>
            </div>
            
            <div class="disclaimer">
                <p>This email was sent to ${email} as part of your event registration.</p>
                <p>If you have any questions, please contact us at <a href="mailto:support@quadsync.com" style="color: #9ca3af;">support@quadsync.com</a></p>
                <p>© ${new Date().getFullYear()} QuadSync Events. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
      `,
    };

    // Send email with retry logic
    await retry(() => transporter.sendMail(mailOptions));

    console.log('✅ Confirmation email sent to:', email);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

module.exports = sendConfirmationEmail;
