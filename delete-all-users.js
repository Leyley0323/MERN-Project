require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function deleteAllUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Count users before deletion
    const countBefore = await User.countDocuments({});
    console.log(`Found ${countBefore} user(s) in database\n`);

    if (countBefore === 0) {
      console.log('No users to delete.');
      process.exit(0);
    }

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} user(s)`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

deleteAllUsers();
