const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 8
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
// Note: code already has an index from unique: true
shoppingListSchema.index({ creatorId: 1 });
shoppingListSchema.index({ members: 1 });

// Update updatedAt before saving
shoppingListSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to generate unique code
shoppingListSchema.statics.generateUniqueCode = async function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 6-8 character code
    const length = 6 + Math.floor(Math.random() * 3); // 6, 7, or 8 characters
    code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Check if code already exists
    const existing = await this.findOne({ code: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

// Method to add member
shoppingListSchema.methods.addMember = function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
  }
};

// Method to remove member
shoppingListSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(memberId => !memberId.equals(userId));
};

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);

module.exports = ShoppingList;

