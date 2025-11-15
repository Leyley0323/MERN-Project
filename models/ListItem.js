const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShoppingList',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
    max: 9999
  },
  weight: {
    type: Number,
    default: null,
    min: 0
  },
  weightUnit: {
    type: String,
    enum: ['lbs', 'kg', 'oz', 'g', 'lb'],
    default: null
  },
  purchased: {
    type: Boolean,
    default: false
  },
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purchasedAt: {
    type: Date,
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster lookups
listItemSchema.index({ listId: 1, purchased: 1 });
listItemSchema.index({ listId: 1 });
listItemSchema.index({ addedBy: 1 });

// Update updatedAt before saving
listItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set purchasedAt when item is marked as purchased
  if (this.purchased && !this.purchasedAt) {
    this.purchasedAt = new Date();
  }
  
  // Clear purchasedAt when item is marked as unpurchased
  if (!this.purchased && this.purchasedAt) {
    this.purchasedAt = null;
    this.purchasedBy = null;
  }
  
  next();
});

const ListItem = mongoose.model('ListItem', listItemSchema);

module.exports = ListItem;

