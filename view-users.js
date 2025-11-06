require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function viewAndDeleteUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Username: ${user.login}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Verified: ${user.emailVerified}`);
      console.log(`   ID: ${user._id}`);
      console.log('');
    });

    // If you want to delete all users, uncomment the next line:
    // await User.deleteMany({});
    // console.log('All users deleted!');

    // If you want to delete a specific user by email, uncomment and modify:
    // const emailToDelete = 'user@example.com';
    // const result = await User.deleteOne({ email: emailToDelete });
    // console.log(`Deleted ${result.deletedCount} user(s) with email: ${emailToDelete}`);

    // If you want to delete unverified users, uncomment:
    // const result = await User.deleteMany({ emailVerified: false });
    // console.log(`Deleted ${result.deletedCount} unverified user(s)`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

viewAndDeleteUsers();
