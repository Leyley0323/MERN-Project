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

// Test connection with timeout
console.log('Testing SMTP connection to SendGrid...\n');

const verifyTimeout = setTimeout(() => {
  console.error('❌ Connection test timed out after 10 seconds');
  console.error('This might indicate a firewall issue or SendGrid server problem.');
  console.error('Please check:');
  console.error('1. Server firewall allows outbound connections on port 587');
  console.error('2. SendGrid service status');
  console.error('3. API key permissions in SendGrid');
  process.exit(1);
}, 10000);

transporter.verify(function (error, success) {
  clearTimeout(verifyTimeout);
  
  if (error) {
    console.error('❌ Connection Error:', error.message || error);
    console.error('Error Code:', error.code);
    console.error('Error Command:', error.command);
    console.error('Error Response:', error.response);
    console.error('Error Response Code:', error.responseCode);
    
    if (error.responseCode === 535) {
      console.error('\n⚠️  ERROR 535: Authentication failed!');
      console.error('Please check:');
      console.error('1. EMAIL_USER should be exactly "apikey"');
      console.error('2. EMAIL_PASSWORD should be your SendGrid API key');
      console.error('3. API key has "Mail Send" permissions in SendGrid');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection timeout/refused!');
      console.error('Please check:');
      console.error('1. Server firewall allows outbound connections');
      console.error('2. SMTP_HOST is correct: smtp.sendgrid.net');
      console.error('3. SMTP_PORT is correct: 587');
    }
    process.exit(1);
  } else {
    console.log('✅ Server is ready to send emails\n');
    
    // Try sending test email
    console.log('Attempting to send test email...');
    const mailOptions = {
      from: `"Cards App" <${process.env.SENDER_EMAIL}>`,
      to: process.env.SENDER_EMAIL, // Send to yourself for testing
      subject: 'Test Email from Cards App',
      text: 'This is a test email. If you receive this, your SendGrid configuration is working!',
      html: '<p>This is a test email. If you receive this, your SendGrid configuration is working!</p>'
    };

    const sendTimeout = setTimeout(() => {
      console.error('❌ Email send timed out after 15 seconds');
      process.exit(1);
    }, 15000);

    transporter.sendMail(mailOptions, function (error, info) {
      clearTimeout(sendTimeout);
      
      if (error) {
        console.error('❌ Error sending test email:', error.message || error);
        console.error('Error Code:', error.code);
        console.error('Error Command:', error.command);
        console.error('Error Response:', error.response);
        console.error('Error Response Code:', error.responseCode);
        
        if (error.responseCode === 550) {
          console.error('\n⚠️  ERROR 550: Sender email not verified in SendGrid!');
          console.error('Please verify your sender email in SendGrid Dashboard:');
          console.error('1. Go to https://app.sendgrid.com/');
          console.error('2. Navigate to Settings > Sender Authentication');
          console.error('3. Click "Verify a Single Sender"');
          console.error('4. Enter and verify:', process.env.SENDER_EMAIL);
          console.error('5. Wait 5-10 minutes after verification before testing again');
        } else if (error.responseCode === 535) {
          console.error('\n⚠️  ERROR 535: Authentication failed!');
          console.error('Please check your EMAIL_USER and EMAIL_PASSWORD in .env file');
        } else if (error.responseCode === 403) {
          console.error('\n⚠️  ERROR 403: API key does not have Mail Send permissions!');
          console.error('Please check your SendGrid API key permissions');
        }
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n📧 Check your inbox:', process.env.SENDER_EMAIL);
        console.log('(Also check spam folder)');
        console.log('\n✅ Email configuration is working correctly!');
        process.exit(0);
      }
    });
  }
});
