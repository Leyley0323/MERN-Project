require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Get email from command line argument
const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.log('Usage: node delete-user.js <email>');
  console.log('Example: node delete-user.js user@example.com');
  process.exit(1);
}

async function deleteUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find and delete user
    const result = await User.deleteOne({ email: emailToDelete.toLowerCase() });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Successfully deleted user with email: ${emailToDelete}`);
    } else {
      console.log(`❌ No user found with email: ${emailToDelete}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteUser();
