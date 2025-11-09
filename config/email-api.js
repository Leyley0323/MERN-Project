// SendGrid API-based email configuration (uses HTTPS instead of SMTP)
// This avoids firewall issues with port 587

const sgMail = require('@sendgrid/mail');

// Set SendGrid API key
if (!process.env.EMAIL_PASSWORD) {
  console.error('ERROR: EMAIL_PASSWORD (SendGrid API key) is not set in .env file');
} else {
  sgMail.setApiKey(process.env.EMAIL_PASSWORD);
}

const sendVerificationEmail = async (email, token, firstName) => {
  try {
    // Remove trailing slash from FRONTEND_URL if present
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

    if (!senderEmail) {
      console.error('Cannot send verification email: SENDER_EMAIL or EMAIL_USER not set');
      return false;
    }

    // Log the verification URL for debugging
    console.log(`[sendVerificationEmail] Using FRONTEND_URL: ${frontendUrl}`);
    console.log(`[sendVerificationEmail] Verification URL: ${verificationUrl}`);
    console.log(`[sendVerificationEmail] Sender: ${senderEmail}`);
    console.log(`[sendVerificationEmail] Recipient: ${email}`);

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: 'Cards App'
      },
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
      text: `Hi ${firstName},\n\nThank you for signing up. Please verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.`
    };

    // Set a timeout for email sending (15 seconds)
    const sendPromise = sgMail.send(msg);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 15000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log('✅ Verification email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ ERROR sending verification email to:', email);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    // Provide helpful error messages
    if (error.response) {
      console.error('Error response body:', error.response.body);
      console.error('Error response status:', error.response.status);
      
      if (error.response.status === 403) {
        console.error('⚠️  ERROR 403: API key does not have Mail Send permissions!');
        console.error('Please check your SendGrid API key permissions.');
      } else if (error.response.status === 401) {
        console.error('⚠️  ERROR 401: Invalid API key!');
        console.error('Please check your EMAIL_PASSWORD in .env file.');
      }
    } else if (error.message === 'Email send timeout') {
      console.error('⚠️  ERROR: Email send timeout (15 seconds)');
      console.error('SendGrid API might be slow or unreachable.');
    }
    
    console.error('Full error:', error);
    return false;
  }
};

const sendPasswordResetEmail = async (email, token, firstName) => {
  try {
    // Remove trailing slash from FRONTEND_URL if present
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER;

    if (!senderEmail) {
      console.error('Cannot send password reset email: SENDER_EMAIL or EMAIL_USER not set');
      return false;
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: 'Cards App'
      },
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
      text: `Hi ${firstName},\n\nWe received a request to reset your password. Click this link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.`
    };

    // Set a timeout for email sending (15 seconds)
    const sendPromise = sgMail.send(msg);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email send timeout')), 15000)
    );

    await Promise.race([sendPromise, timeoutPromise]);

    console.log('✅ Password reset email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('❌ ERROR sending password reset email to:', email);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.response) {
      console.error('Error response body:', error.response.body);
      console.error('Error response status:', error.response.status);
    }
    
    console.error('Full error:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

