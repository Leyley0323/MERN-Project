// Test SendGrid API (uses HTTPS instead of SMTP)
// This avoids firewall issues with port 587

require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('========================================');
console.log('Testing SendGrid API Configuration...');
console.log('========================================\n');

console.log('Environment Variables:');
console.log('  EMAIL_PASSWORD (API Key) exists:', !!process.env.EMAIL_PASSWORD);
console.log('  EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0);
console.log('  SENDER_EMAIL:', process.env.SENDER_EMAIL || 'NOT SET ❌');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET (will use localhost)');
console.log('\n---\n');

// Validate required variables
if (!process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR: EMAIL_PASSWORD (SendGrid API key) is missing!');
  console.error('Please check your .env file.');
  process.exit(1);
}

if (!process.env.SENDER_EMAIL) {
  console.error('⚠️  WARNING: SENDER_EMAIL is not set.');
  process.exit(1);
}

// Set API key
sgMail.setApiKey(process.env.EMAIL_PASSWORD);

console.log('Testing SendGrid API connection...\n');

// Test sending email
const msg = {
  to: process.env.SENDER_EMAIL, // Send to yourself for testing
  from: {
    email: process.env.SENDER_EMAIL,
    name: 'Cards App'
  },
  subject: 'Test Email from Cards App (API)',
  text: 'This is a test email sent via SendGrid API. If you receive this, your configuration is working!',
  html: '<p>This is a test email sent via SendGrid API. If you receive this, your configuration is working!</p>'
};

const sendTimeout = setTimeout(() => {
  console.error('❌ Email send timed out after 15 seconds');
  process.exit(1);
}, 15000);

sgMail.send(msg)
  .then((response) => {
    clearTimeout(sendTimeout);
    console.log('✅ Test email sent successfully!');
    console.log('Response status code:', response[0].statusCode);
    console.log('Response headers:', JSON.stringify(response[0].headers, null, 2));
    console.log('\n📧 Check your inbox:', process.env.SENDER_EMAIL);
    console.log('(Also check spam folder)');
    console.log('\n✅ SendGrid API configuration is working correctly!');
    console.log('\nNote: This uses HTTPS (port 443) instead of SMTP (port 587),');
    console.log('so it should work even if your server blocks port 587.');
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(sendTimeout);
    console.error('❌ Error sending test email:', error.message || error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response body:', JSON.stringify(error.response.body, null, 2));
      
      if (error.response.status === 403) {
        console.error('\n⚠️  ERROR 403: API key does not have Mail Send permissions!');
        console.error('Please check your SendGrid API key permissions:');
        console.error('1. Go to https://app.sendgrid.com/');
        console.error('2. Navigate to Settings > API Keys');
        console.error('3. Check your API key has "Mail Send" permission');
      } else if (error.response.status === 401) {
        console.error('\n⚠️  ERROR 401: Invalid API key!');
        console.error('Please check your EMAIL_PASSWORD in .env file.');
        console.error('Make sure it\'s your SendGrid API key (starts with SG.)');
      } else if (error.response.status === 400) {
        console.error('\n⚠️  ERROR 400: Bad request!');
        console.error('Common causes:');
        console.error('1. Sender email not verified in SendGrid');
        console.error('2. Invalid email format');
        console.error('Error details:', error.response.body);
      }
    } else {
      console.error('Full error:', error);
    }
    process.exit(1);
  });

