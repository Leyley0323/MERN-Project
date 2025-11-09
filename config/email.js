const nodemailer = require('nodemailer');

// Create transporter - configure with your email service
// For Gmail, you'll need to use an App Password
// For other services, adjust accordingly
const createTransporter = () => {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('Email configuration error: EMAIL_USER or EMAIL_PASSWORD is missing');
      return null;
    }

    // If using Gmail
    if (process.env.EMAIL_SERVICE === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
        },
      });
    }
    
    // For other SMTP services (SendGrid, Outlook, etc.)
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    
    console.log(`Creating SMTP transporter: ${smtpHost}:${smtpPort}`);
    
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      requireTLS: true, // Require TLS for SendGrid
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates if needed
      }
    });
  } catch (error) {
    console.error('Error creating email transporter:', error);
    return null;
  }
};

const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('Cannot send verification email: transporter not available');
      return false;
    }

    // Remove trailing slash from FRONTEND_URL if present
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    
    // Log the verification URL for debugging
    console.log(`[sendVerificationEmail] Using FRONTEND_URL: ${frontendUrl}`);
    console.log(`[sendVerificationEmail] Verification URL: ${verificationUrl}`);
    console.log(`[sendVerificationEmail] Sender: ${senderEmail}`);
    console.log(`[sendVerificationEmail] Recipient: ${email}`);
    console.log(`[sendVerificationEmail] SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`[sendVerificationEmail] SMTP Port: ${process.env.SMTP_PORT || '587'}`);
    console.log(`[sendVerificationEmail] EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`[sendVerificationEmail] EMAIL_PASSWORD exists: ${!!process.env.EMAIL_PASSWORD}`);
    
    if (!senderEmail) {
      console.error('Cannot send verification email: SENDER_EMAIL or EMAIL_USER not set');
      return false;
    }
    
    const mailOptions = {
      from: `"Cards App" <${senderEmail}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Cards App!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© Cards App</p>
        </div>
      `,
    };

    // Set a timeout for email sending (10 seconds)
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 10000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('✅ Verification email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    return true;
  } catch (error) {
    console.error('❌ ERROR sending verification email to:', email);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Error response:', error.response);
    console.error('Error responseCode:', error.responseCode);
    
    // Provide helpful error messages
    if (error.responseCode === 550) {
      console.error('⚠️  ERROR 550: Sender email not verified in SendGrid!');
      console.error('Please verify your sender email in SendGrid Dashboard.');
      console.error('SENDER_EMAIL:', process.env.SENDER_EMAIL);
    } else if (error.responseCode === 535) {
      console.error('⚠️  ERROR 535: Authentication failed!');
      console.error('Please check your EMAIL_USER and EMAIL_PASSWORD in .env file.');
    } else if (error.message === 'Email send timeout') {
      console.error('⚠️  ERROR: Email send timeout (10 seconds)');
      console.error('SendGrid might be slow or unreachable.');
    }
    
    console.error('Full error stack:', error.stack);
    return false;
  }
};

const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('Cannot send password reset email: transporter not available');
      return false;
    }

    // Remove trailing slash from FRONTEND_URL if present
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;
    
    if (!senderEmail) {
      console.error('Cannot send password reset email: SENDER_EMAIL or EMAIL_USER not set');
      return false;
    }
    
    const mailOptions = {
      from: `"Cards App" <${senderEmail}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Click the link below to reset it:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">© Cards App</p>
        </div>
      `,
    };

    // Set a timeout for email sending (10 seconds)
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 10000)
    );

    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('Password reset email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    });
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
