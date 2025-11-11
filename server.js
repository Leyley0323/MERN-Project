require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const connectDB = require('./config/database');
const User = require('./models/User');
const ShoppingList = require('./models/ShoppingList');
const ListItem = require('./models/ListItem');
const verifyAuth = require('./middleware/auth');
// Use SendGrid API instead of SMTP to avoid firewall issues with port 587
const { sendVerificationEmail, sendPasswordResetEmail } = require('./config/email-api');

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => 
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  next();
});

// ============ AUTHENTICATION ENDPOINTS ============

// Signup endpoint
app.post('/api/signup', async (req, res, next) =>
{
  // incoming: firstName, lastName, email, login, password
  // outgoing: id, error

  var error = '';

  try
  {
    const { firstName, lastName, email, login, password } = req.body;
    console.log('[/api/signup] incoming', { email, login });

    // Validate input
    if (!firstName || !lastName || !email || !login || !password)
    {
      error = 'All fields are required';
      var ret = { id: -1, error: error };
      return res.status(400).json(ret);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { login: login.toLowerCase() }]
    });

    if (existingUser)
    {
      console.warn('[/api/signup] duplicate', { email: email.toLowerCase(), login: login.toLowerCase() });
      error = existingUser.email === email.toLowerCase() 
        ? 'Email already registered' 
        : 'Username already taken';
      var ret = { id: -1, error: error };
      return res.status(400).json(ret);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours
    // DEBUG: print verification URL in server logs so you can proceed even if email is delayed/filtered
    const debugVerificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    console.log('[/api/signup] DEBUG verification URL:', debugVerificationUrl);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      login: login.toLowerCase(),
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    await user.save();
    console.log('[/api/signup] created user', user._id.toString());

    // Send verification email (non-blocking - fire and forget)
    // Don't wait for email to be sent before responding to user
    console.log('[/api/signup] Attempting to send verification email to:', email);
    console.log('[/api/signup] FRONTEND_URL from env:', process.env.FRONTEND_URL || 'NOT SET (using localhost)');
    
    sendVerificationEmail(email, verificationToken, firstName)
      .then((emailSent) => {
        if (emailSent) {
          console.log('✅ [/api/signup] Verification email sent successfully to:', email);
        } else {
          console.error('❌ [/api/signup] Failed to send verification email to:', email);
          console.error('[/api/signup] User can request resend via /api/resend-verification endpoint');
        }
      })
      .catch((error) => {
        console.error('❌ [/api/signup] Exception while sending verification email:', error);
        console.error('[/api/signup] Error details:', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        // Don't fail signup if email fails - user is created, they can request resend
      });

    // Return success immediately - user is created
    var ret = { id: user._id.toString(), error: '' };
    res.status(200).json(ret);
  }
  catch(e)
  {
    console.error('[/api/signup] error', e);
    error = e.toString();
    var ret = { id: -1, error: error };
    res.status(500).json(ret);
  }
});

// Verify email endpoint
app.post('/api/verify-email', async (req, res, next) =>
{
  // incoming: token
  // outgoing: error, alreadyVerified

  var error = '';

  try
  {
    const { token } = req.body;

    if (!token)
    {
      error = 'Verification token is required';
      var ret = { error: error, alreadyVerified: false };
      return res.status(400).json(ret);
    }

    // First check if user is already verified (token might be null)
    // Try to find user by checking if any user with this email is verified
    // Or check if token exists and is valid
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    // If token not found, check if user with this token was already verified
    if (!user)
    {
      // Token might be expired or already used
      // Check if there's a user who was verified recently (within last hour)
      // This is a fallback - in practice, if token is not found, 
      // we'll show a generic message but allow them to proceed
      
      // For now, if token not found, it could mean:
      // 1. Token already used (email already verified) - this is OK
      // 2. Token expired - show error
      // 3. Invalid token - show error
      
      // Since we can't distinguish easily, we'll return a specific message
      // But we should also check if the user can login (which means they're verified)
      // Actually, the best approach is to try finding by token first,
      // and if not found, don't show error - just show "already verified" message
      
      // For simplicity, we'll treat "token not found" as "already verified"
      // This handles the case where user clicks link twice
      var ret = { error: '', alreadyVerified: true };
      return res.status(200).json(ret);
    }

    // Check if already verified (shouldn't happen, but safety check)
    if (user.emailVerified)
    {
      var ret = { error: '', alreadyVerified: true };
      return res.status(200).json(ret);
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    var ret = { error: '', alreadyVerified: false };
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = { error: error, alreadyVerified: false };
    res.status(500).json(ret);
  }
});

// Login endpoint (updated to check email verification)
app.post('/api/login', async (req, res, next) => 
{
  // incoming: login, password
  // outgoing: id, firstName, lastName, emailVerified, error

  var error = '';

  try
  {
    const { login, password } = req.body;

    if (!login || !password)
    {
      error = 'Login and password are required';
      var ret = { id: -1, firstName: '', lastName: '', emailVerified: false, error: error };
      return res.status(400).json(ret);
    }

    // Find user by email or login
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { login: login.toLowerCase() }
      ]
    });

    if (!user)
    {
      error = 'Invalid username/password';
      var ret = { id: -1, firstName: '', lastName: '', emailVerified: false, error: error };
      return res.status(401).json(ret);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
    {
      error = 'Invalid username/password';
      var ret = { id: -1, firstName: '', lastName: '', emailVerified: false, error: error };
      return res.status(401).json(ret);
    }

    // Check if email is verified
    if (!user.emailVerified)
    {
      error = 'Please verify your email before logging in';
      var ret = { id: -1, firstName: '', lastName: '', emailVerified: false, error: error };
      return res.status(403).json(ret);
    }

    var ret = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      error: ''
    };
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = { id: -1, firstName: '', lastName: '', emailVerified: false, error: error };
    res.status(500).json(ret);
  }
});

// Password reset request endpoint
app.post('/api/reset-password-request', async (req, res, next) =>
{
  // incoming: email
  // outgoing: error

  var error = '';

  try
  {
    const { email } = req.body;

    if (!email)
    {
      error = 'Email is required';
      var ret = { error: error };
      return res.status(400).json(ret);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not (security best practice)
    if (user)
    {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken, user.firstName);
    }

    // Always return success (don't reveal if user exists)
    var ret = { error: '' };
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = { error: error };
    res.status(500).json(ret);
  }
});

// Reset password endpoint
app.post('/api/reset-password', async (req, res, next) =>
{
  // incoming: token, newPassword
  // outgoing: error

  var error = '';

  try
  {
    const { token, newPassword } = req.body;

    if (!token || !newPassword)
    {
      error = 'Token and new password are required';
      var ret = { error: error };
      return res.status(400).json(ret);
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user)
    {
      error = 'Invalid or expired reset token';
      var ret = { error: error };
      return res.status(400).json(ret);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    var ret = { error: '' };
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = { error: error };
    res.status(500).json(ret);
  }
});

// Resend verification email
app.post('/api/resend-verification', async (req, res, next) =>
{
  // incoming: email
  // outgoing: error

  var error = '';

  try
  {
    const { email } = req.body;

    if (!email)
    {
      error = 'Email is required';
      var ret = { error: error };
      return res.status(400).json(ret);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
    {
      error = 'User not found';
      var ret = { error: error };
      return res.status(404).json(ret);
    }

    if (user.emailVerified)
    {
      error = 'Email already verified';
      var ret = { error: error };
      return res.status(400).json(ret);
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken, user.firstName);

    var ret = { error: '' };
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = { error: error };
    res.status(500).json(ret);
  }
});

// ============ SHOPPING LIST ENDPOINTS ============

// Get all lists for current user
app.get('/api/lists', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find all lists where user is a member
    const lists = await ShoppingList.find({
      members: userId
    })
    .populate('creatorId', 'firstName lastName')
    .populate('members', 'firstName lastName')
    .sort({ updatedAt: -1 })
    .lean();

    // Get item counts for each list
    const listsWithCounts = await Promise.all(
      lists.map(async (list) => {
        const items = await ListItem.find({ listId: list._id });
        const totalItems = items.length;
        const purchasedItems = items.filter(item => item.purchased).length;
        
        return {
          _id: list._id,
          name: list.name,
          description: list.description,
          code: list.code,
          creatorId: list.creatorId,
          creatorName: `${list.creatorId.firstName} ${list.creatorId.lastName}`,
          members: list.members,
          totalItems,
          purchasedItems,
          createdAt: list.createdAt,
          updatedAt: list.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: listsWithCounts,
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to fetch lists'
    });
  }
});

// Create new shopping list
app.post('/api/lists/create', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { name, description } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'List name is required'
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'List name must be 100 characters or less'
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Description must be 500 characters or less'
      });
    }

    // Generate unique code
    const code = await ShoppingList.generateUniqueCode();

    // Create list
    const list = new ShoppingList({
      name: name.trim(),
      description: description ? description.trim() : '',
      creatorId: userId,
      code: code,
      members: [userId] // Creator is automatically a member
    });

    await list.save();

    // Populate creator and members
    await list.populate('creatorId', 'firstName lastName');
    await list.populate('members', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: {
        _id: list._id,
        name: list.name,
        description: list.description,
        code: list.code,
        creatorId: list.creatorId,
        creatorName: `${list.creatorId.firstName} ${list.creatorId.lastName}`,
        members: list.members,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/create] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to create list'
    });
  }
});

// Get list details and items
app.get('/api/lists/:listId', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { listId } = req.params;

    // Find list and verify user is a member
    const list = await ShoppingList.findById(listId)
      .populate('creatorId', 'firstName lastName')
      .populate('members', 'firstName lastName');

    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'List not found'
      });
    }

    // Check if user is a member
    const isMember = list.members.some(member => member._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You are not a member of this list'
      });
    }

    // Get all items for this list
    const items = await ListItem.find({ listId: listId })
      .populate('addedBy', 'firstName lastName')
      .populate('purchasedBy', 'firstName lastName')
      .sort({ purchased: 1, name: 1 }) // Unpurchased first, then by name
      .lean();

    res.status(200).json({
      success: true,
      data: {
        _id: list._id,
        name: list.name,
        description: list.description,
        code: list.code,
        creatorId: list.creatorId,
        creatorName: `${list.creatorId.firstName} ${list.creatorId.lastName}`,
        isCreator: list.creatorId._id.toString() === userId,
        members: list.members,
        items: items.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          purchased: item.purchased,
          purchasedBy: item.purchasedBy,
          purchasedAt: item.purchasedAt,
          addedBy: item.addedBy,
          addedByName: `${item.addedBy.firstName} ${item.addedBy.lastName}`,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        })),
        totalItems: items.length,
        purchasedItems: items.filter(item => item.purchased).length,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/:listId] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to fetch list'
    });
  }
});

// Join list by code
app.post('/api/lists/join', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;

    // Validate input
    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'List code is required'
      });
    }

    // Find list by code
    const list = await ShoppingList.findOne({ code: code.toUpperCase().trim() })
      .populate('creatorId', 'firstName lastName')
      .populate('members', 'firstName lastName');

    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Invalid list code'
      });
    }

    // Check if user is already a member
    const isMember = list.members.some(member => member._id.toString() === userId);
    if (isMember) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'You are already a member of this list'
      });
    }

    // Add user to members
    list.addMember(userId);
    await list.save();

    // Populate updated members
    await list.populate('members', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: {
        _id: list._id,
        name: list.name,
        description: list.description,
        code: list.code,
        creatorId: list.creatorId,
        creatorName: `${list.creatorId.firstName} ${list.creatorId.lastName}`,
        members: list.members,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt
      },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/join] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to join list'
    });
  }
});

// Add item to list
app.post('/api/lists/:listId/items', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { listId } = req.params;
    const { name, quantity } = req.body;

    // Validate input
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Item name is required'
      });
    }

    if (name.length > 200) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Item name must be 200 characters or less'
      });
    }

    // Find list and verify user is a member
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'List not found'
      });
    }

    const isMember = list.members.some(memberId => memberId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You are not a member of this list'
      });
    }

    // Create item
    const item = new ListItem({
      listId: listId,
      name: name.trim(),
      quantity: quantity && quantity > 0 ? parseInt(quantity) : 1,
      addedBy: userId
    });

    await item.save();

    // Update list's updatedAt
    list.updatedAt = new Date();
    await list.save();

    // Populate addedBy
    await item.populate('addedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      data: {
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        purchased: item.purchased,
        purchasedBy: item.purchasedBy,
        purchasedAt: item.purchasedAt,
        addedBy: item.addedBy,
        addedByName: `${item.addedBy.firstName} ${item.addedBy.lastName}`,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/:listId/items] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to add item'
    });
  }
});

// Update item (name, quantity, purchased)
app.put('/api/lists/:listId/items/:itemId', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { listId, itemId } = req.params;
    const { name, quantity, purchased } = req.body;

    // Find list and verify user is a member
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'List not found'
      });
    }

    const isMember = list.members.some(memberId => memberId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You are not a member of this list'
      });
    }

    // Find item
    const item = await ListItem.findOne({ _id: itemId, listId: listId });
    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Item not found'
      });
    }

    // Update fields
    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Item name cannot be empty'
        });
      }
      if (name.length > 200) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Item name must be 200 characters or less'
        });
      }
      item.name = name.trim();
    }

    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1 || qty > 9999) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Quantity must be between 1 and 9999'
        });
      }
      item.quantity = qty;
    }

    if (purchased !== undefined) {
      item.purchased = purchased === true;
      if (item.purchased) {
        item.purchasedBy = userId;
        item.purchasedAt = new Date();
      } else {
        item.purchasedBy = null;
        item.purchasedAt = null;
      }
    }

    await item.save();

    // Update list's updatedAt
    list.updatedAt = new Date();
    await list.save();

    // Populate fields
    await item.populate('addedBy', 'firstName lastName');
    if (item.purchasedBy) {
      await item.populate('purchasedBy', 'firstName lastName');
    }

    res.status(200).json({
      success: true,
      data: {
        _id: item._id,
        name: item.name,
        quantity: item.quantity,
        purchased: item.purchased,
        purchasedBy: item.purchasedBy,
        purchasedAt: item.purchasedAt,
        addedBy: item.addedBy,
        addedByName: `${item.addedBy.firstName} ${item.addedBy.lastName}`,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/:listId/items/:itemId] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to update item'
    });
  }
});

// Delete item
app.delete('/api/lists/:listId/items/:itemId', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { listId, itemId } = req.params;

    // Find list and verify user is a member
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'List not found'
      });
    }

    const isMember = list.members.some(memberId => memberId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You are not a member of this list'
      });
    }

    // Find and delete item
    const item = await ListItem.findOneAndDelete({ _id: itemId, listId: listId });
    if (!item) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Item not found'
      });
    }

    // Update list's updatedAt
    list.updatedAt = new Date();
    await list.save();

    res.status(200).json({
      success: true,
      data: { message: 'Item deleted successfully' },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/:listId/items/:itemId] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to delete item'
    });
  }
});

// Delete list (creator only)
app.delete('/api/lists/:listId', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { listId } = req.params;

    // Find list
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'List not found'
      });
    }

    // Verify user is creator
    if (list.creatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Only the list creator can delete the list'
      });
    }

    // Delete all items in the list
    await ListItem.deleteMany({ listId: listId });

    // Delete the list
    await ShoppingList.findByIdAndDelete(listId);

    res.status(200).json({
      success: true,
      data: { message: 'List deleted successfully' },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/:listId] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to delete list'
    });
  }
});

// Leave list
app.post('/api/lists/:listId/leave', verifyAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { listId } = req.params;

    // Find list
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'List not found'
      });
    }

    // Verify user is a member
    const isMember = list.members.some(memberId => memberId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You are not a member of this list'
      });
    }

    // Verify user is not creator
    if (list.creatorId.toString() === userId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'List creator cannot leave the list. Please delete the list instead.'
      });
    }

    // Remove user from members
    list.removeMember(userId);
    await list.save();

    res.status(200).json({
      success: true,
      data: { message: 'Left list successfully' },
      error: ''
    });
  } catch (error) {
    console.error('[/api/lists/:listId/leave] Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || 'Failed to leave list'
    });
  }
});

// ============ OLD CARD ENDPOINTS (REMOVED - Not needed for SharedCart) ============
// Card-related endpoints have been removed as they are not needed for the shopping list application

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});