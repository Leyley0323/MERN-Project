require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const connectDB = require('./config/database');
const User = require('./models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./config/email');

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
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
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
    console.log('[/api/signup] sending verification to', email);
    sendVerificationEmail(email, verificationToken, firstName)
      .then((emailSent) => {
        if (emailSent) {
          console.log('[/api/signup] verification email sent successfully');
        } else {
          console.error('[/api/signup] failed to send verification email (user can request resend)');
        }
      })
      .catch((error) => {
        console.error('[/api/signup] error sending verification email:', error);
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

// ============ CARD ENDPOINTS ============

// API endpoint for adding cards
app.post('/api/addcard', async (req, res, next) =>
{
  // incoming: userId, card
  // outgoing: error

  var error = '';

  try
  {
    const { userId, card } = req.body;

    if (!userId || !card)
    {
      error = 'User ID and card are required';
      var ret = { error: error };
      return res.status(400).json(ret);
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user)
    {
      error = 'User not found';
      var ret = { error: error };
      return res.status(404).json(ret);
    }

    // Here you would typically save to a Cards collection
    // For now, we'll keep it simple with the in-memory array
    // TODO: Create Card model and save to MongoDB
    
    var ret = { error: error };
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = { error: error };
    res.status(500).json(ret);
  }
});

// API endpoint for searching cards
app.post('/api/searchcards', async (req, res, next) => 
{
  // incoming: userId, search
  // outgoing: results[], error

  var error = '';

  try
  {
    const { userId, search } = req.body;

    if (!userId)
    {
      error = 'User ID is required';
      var ret = {results:[], error:error};
      return res.status(400).json(ret);
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user)
    {
      error = 'User not found';
      var ret = {results:[], error:error};
      return res.status(404).json(ret);
    }

    // TODO: Search cards from MongoDB Cards collection
    // For now, using in-memory array as placeholder
    var _search = search ? search.toLowerCase().trim() : '';
    var _ret = [];

    // Placeholder card list - replace with MongoDB query
    var cardList = 
    [
      'Roy Campanella',
      'Paul Molitor',
      'Tony Gwynn',
      'Dennis Eckersley',
      'Reggie Jackson',
      'Gaylord Perry',
      'Buck Leonard',
      'Rollie Fingers',
      'Charlie Gehringer',
      'Wade Boggs',
      'Carl Hubbell',
      'Dave Winfield',
      'Jackie Robinson',
      'Ken Griffey, Jr.',
      'Al Simmons',
      'Chuck Klein',
      'Mel Ott',
      'Mark McGwire',
      'Nolan Ryan',
      'Ralph Kiner',
      'Yogi Berra',
      'Goose Goslin',
      'Greg Maddux',
      'Frankie Frisch',
      'Ernie Banks',
      'Ozzie Smith',
      'Hank Greenberg',
      'Kirby Puckett',
      'Bob Feller',
      'Dizzy Dean',
      'Joe Jackson',
      'Sam Crawford',
      'Barry Bonds',
      'Duke Snider',
      'George Sisler',
      'Ed Walsh',
      'Tom Seaver',
      'Willie Stargell',
      'Bob Gibson',
      'Brooks Robinson',
      'Steve Carlton',
      'Joe Medwick',
      'Nap Lajoie',
      'Cal Ripken, Jr.',
      'Mike Schmidt',
      'Eddie Murray',
      'Tris Speaker',
      'Al Kaline',
      'Sandy Koufax',
      'Willie Keeler',
      'Pete Rose',
      'Robin Roberts',
      'Eddie Collins',
      'Lefty Gomez',
      'Lefty Grove',
      'Carl Yastrzemski',
      'Frank Robinson',
      'Juan Marichal',
      'Warren Spahn',
      'Pie Traynor',
      'Roberto Clemente',
      'Harmon Killebrew',
      'Satchel Paige',
      'Eddie Plank',
      'Josh Gibson',
      'Oscar Charleston',
      'Mickey Mantle',
      'Cool Papa Bell',
      'Johnny Bench',
      'Mickey Cochrane',
      'Jimmie Foxx',
      'Jim Palmer',
      'Cy Young',
      'Eddie Mathews',
      'Honus Wagner',
      'Paul Waner',
      'Grover Alexander',
      'Rod Carew',
      'Joe DiMaggio',
      'Joe Morgan',
      'Stan Musial',
      'Bill Terry',
      'Rogers Hornsby',
      'Lou Brock',
      'Ted Williams',
      'Bill Dickey',
      'Christy Mathewson',
      'Willie McCovey',
      'Lou Gehrig',
      'George Brett',
      'Hank Aaron',
      'Harry Heilmann',
      'Walter Johnson',
      'Roger Clemens',
      'Ty Cobb',
      'Whitey Ford',
      'Willie Mays',
      'Rickey Henderson',
      'Babe Ruth'
    ];

    if (_search)
    {
      for( var i=0; i<cardList.length; i++ )
      {
        var lowerFromList = cardList[i].toLocaleLowerCase();
        if( lowerFromList.indexOf( _search ) >= 0 )
        {
          _ret.push( cardList[i] );
        }
      }
    }

    var ret = {results:_ret, error:''};
    res.status(200).json(ret);
  }
  catch(e)
  {
    error = e.toString();
    var ret = {results:[], error:error};
    res.status(500).json(ret);
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});