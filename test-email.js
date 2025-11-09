require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('========================================');
console.log('Testing SendGrid Email Configuration...');
console.log('========================================\n');

console.log('Environment Variables:');
console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET (will use smtp.gmail.com)');
console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET (will use 587)');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET ❌');
console.log('  SENDER_EMAIL:', process.env.SENDER_EMAIL || 'NOT SET ❌');
console.log('  EMAIL_PASSWORD exists:', !!process.env.EMAIL_PASSWORD);
console.log('  EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET (will use localhost)');
console.log('\n---\n');

// Validate required variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR: EMAIL_USER or EMAIL_PASSWORD is missing!');
  console.error('Please check your .env file.');
  process.exit(1);
}

if (!process.env.SENDER_EMAIL) {
  console.error('⚠️  WARNING: SENDER_EMAIL is not set. Using EMAIL_USER as sender.');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Connection Error:', error);
    console.error('Error Code:', error.code);
    console.error('Error Command:', error.command);
    console.error('Error Response:', error.response);
  } else {
    console.log('✅ Server is ready to send emails');
    
    // Try sending test email
    const mailOptions = {
      from: `"Cards App" <${process.env.SENDER_EMAIL}>`,
      to: process.env.SENDER_EMAIL, // Send to yourself for testing
      subject: 'Test Email from Cards App',
      text: 'This is a test email. If you receive this, your SendGrid configuration is working!',
      html: '<p>This is a test email. If you receive this, your SendGrid configuration is working!</p>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('❌ Error sending test email:', error);
        console.error('Error Code:', error.code);
        console.error('Error Command:', error.command);
        console.error('Error Response:', error.response);
        console.error('Error Response Code:', error.responseCode);
        
        if (error.responseCode === 550) {
          console.error('\n⚠️  Error 550: Sender email not verified in SendGrid!');
          console.error('Please verify your sender email in SendGrid Dashboard:');
          console.error('1. Go to Settings > Sender Authentication');
          console.error('2. Verify a Single Sender');
          console.error('3. Use email:', process.env.SENDER_EMAIL);
        }
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n📧 Check your inbox:', process.env.SENDER_EMAIL);
        console.log('(Also check spam folder)');
      }
      process.exit(0);
    });
  }
});
