# SharedCart - Frontend & Backend Requirements

## 📱 FRONTEND PAGES

### ✅ Already Implemented (No Changes Needed)
1. **HomePage** (`/`)
   - Landing page with hero section
   - Features section
   - How it works section
   - Navigation to login/signup

2. **LoginPage** (`/login`)
   - Login form (email/username + password)
   - "Forgot Password" link
   - "Create Account" button
   - Resend verification button (if email not verified)

3. **SignUpPage** (`/signup`)
   - Registration form (firstName, lastName, email, username, password)
   - Success message after signup
   - Link to login page

4. **ForgotPasswordPage** (`/forgot-password`)
   - Email input form
   - Submit button to request password reset
   - Success message

5. **ResetPasswordPage** (`/reset-password?token=...`)
   - New password input
   - Confirm password input
   - Submit button
   - Success message + redirect to login

6. **VerifyEmailPage** (`/verify-email?token=...`)
   - Shows verification status
   - Success/error messages
   - Redirect to login after success

### 🆕 Need to Be Created

7. **ListsPage** (`/lists` or `/shoppinglist`)
   - **Purpose**: Show all shopping lists the user is a member of
   - **Content**:
     - Header with "My Shopping Lists" title
     - "Create New List" button
     - "Join List" button (opens join modal or navigates to join page)
     - Grid/list of shopping lists the user belongs to
     - Each list card should show:
       - List name
       - Number of items (total and purchased)
       - List creator name
       - Last updated time
       - "View List" button
     - Empty state: "You don't have any lists yet. Create one!"
   - **API Calls**:
     - `GET /api/lists` - Get all lists for current user
   - **Navigation**:
     - Click "View List" → Navigate to ListDetailPage
     - Click "Create New List" → Navigate to CreateListPage
     - Click "Join List" → Navigate to JoinListPage or open modal

8. **CreateListPage** (`/lists/create`)
   - **Purpose**: Create a new shopping list
   - **Content**:
     - Header: "Create New Shopping List"
     - Form with:
       - List name input (required)
       - Description textarea (optional)
     - "Create List" button
     - "Cancel" button (goes back to ListsPage)
     - Success message + redirect to ListDetailPage
   - **API Calls**:
     - `POST /api/lists/create` - Create new list
   - **Response Handling**:
     - On success: Navigate to `/lists/:listId`
     - On error: Show error message

9. **JoinListPage** (`/lists/join`)
   - **Purpose**: Join an existing shopping list using a code
   - **Content**:
     - Header: "Join Shopping List"
     - Input field for list code (6-8 character code)
     - "Join List" button
     - "Cancel" button (goes back to ListsPage)
     - Error message if code is invalid
     - Success message + redirect to ListDetailPage
   - **API Calls**:
     - `POST /api/lists/join` - Join list by code
   - **Response Handling**:
     - On success: Navigate to `/lists/:listId`
     - On error: Show error message

10. **ListDetailPage** (`/lists/:listId`)
    - **Purpose**: View and manage items in a specific shopping list
    - **Content**:
      - Header with list name and description
      - List info:
        - Creator name
        - List code (for sharing)
        - "Copy Code" button
        - "Delete List" button (only if user is creator)
        - "Leave List" button (if user is not creator)
      - Add item section:
        - Input field for item name
        - Quantity input (optional)
        - "Add Item" button
      - Items list:
        - Each item shows:
          - Checkbox (purchased/unpurchased)
          - Item name (editable inline)
          - Quantity (editable inline)
          - Added by (user name)
          - Delete button (anyone can delete)
        - Sort by: purchased status, then by name
        - Filter: All / Unpurchased / Purchased
      - Stats: "X of Y items purchased"
    - **API Calls**:
      - `GET /api/lists/:listId` - Get list details and items
      - `POST /api/lists/:listId/items` - Add new item
      - `PUT /api/lists/:listId/items/:itemId` - Update item (name, quantity, purchased)
      - `DELETE /api/lists/:listId/items/:itemId` - Delete item
      - `DELETE /api/lists/:listId` - Delete list (creator only)
      - `POST /api/lists/:listId/leave` - Leave list
    - **Real-time Updates**:
      - Poll every 5-10 seconds to refresh items
      - Show "Last updated: X seconds ago"
    - **Navigation**:
      - Back button to ListsPage
      - Share button (copy list code to clipboard)

---

## 🔧 BACKEND FILES

### ✅ Already Implemented (No Changes Needed)
1. **server.js**
   - Main Express server
   - CORS configuration
   - Authentication endpoints (login, signup, verify, reset password)
   - TODO comments for shopping list endpoints

2. **config/database.js**
   - MongoDB connection
   - Connection error handling

3. **config/email-api.js**
   - SendGrid email configuration
   - Verification email function
   - Password reset email function

4. **models/User.js**
   - User schema with:
     - firstName, lastName, email, login, password
     - emailVerificationToken, emailVerificationExpires
     - passwordResetToken, passwordResetExpires
     - emailVerified flag

### 🆕 Need to Be Created

5. **models/ShoppingList.js**
   - **Schema**:
     ```javascript
     {
       name: String (required),
       description: String (optional),
       creatorId: ObjectId (ref: User, required),
       code: String (unique, required, 6-8 characters),
       members: [ObjectId] (ref: User, includes creator),
       createdAt: Date,
       updatedAt: Date
     }
     ```
   - **Methods**:
     - Generate unique code (6-8 characters, alphanumeric)
     - Add member
     - Remove member

6. **models/ListItem.js**
   - **Schema**:
     ```javascript
     {
       listId: ObjectId (ref: ShoppingList, required),
       name: String (required),
       quantity: Number (optional, default: 1),
       purchased: Boolean (default: false),
       purchasedBy: ObjectId (ref: User, optional),
       purchasedAt: Date (optional),
       addedBy: ObjectId (ref: User, required),
       createdAt: Date,
       updatedAt: Date
     }
     ```
   - **Indexes**:
     - listId + purchased (for efficient queries)

7. **routes/lists.js** (or add to server.js)
   - **Endpoints**:
     - `GET /api/lists` - Get all lists for current user
       - Requires: User ID from session/token
       - Returns: Array of lists with basic info
     - `POST /api/lists/create` - Create new list
       - Requires: User ID, list name, description (optional)
       - Returns: Created list with code
     - `GET /api/lists/:listId` - Get list details and items
       - Requires: User ID (must be member), listId
       - Returns: List details + array of items
     - `POST /api/lists/join` - Join list by code
       - Requires: User ID, code
       - Returns: Joined list details
     - `POST /api/lists/:listId/items` - Add item to list
       - Requires: User ID (must be member), listId, item name, quantity (optional)
       - Returns: Created item
     - `PUT /api/lists/:listId/items/:itemId` - Update item
       - Requires: User ID (must be member), listId, itemId, updates (name, quantity, purchased)
       - Returns: Updated item
     - `DELETE /api/lists/:listId/items/:itemId` - Delete item
       - Requires: User ID (must be member), listId, itemId
       - Returns: Success message
     - `DELETE /api/lists/:listId` - Delete list
       - Requires: User ID (must be creator), listId
       - Returns: Success message
     - `POST /api/lists/:listId/leave` - Leave list
       - Requires: User ID (must be member, not creator), listId
       - Returns: Success message

8. **middleware/auth.js** (Optional but Recommended)
   - **Purpose**: Verify user authentication
   - **Function**: 
     - Check if user is logged in (from localStorage or session)
     - Verify user ID exists in database
     - Add user info to request object
   - **Usage**: Add to all shopping list endpoints

9. **utils/listCodeGenerator.js** (Optional Helper)
   - **Purpose**: Generate unique list codes
   - **Function**: 
     - Generate random 6-8 character alphanumeric code
     - Check if code already exists
     - Return unique code

---

## 📋 API ENDPOINT SPECIFICATIONS

### Authentication
All shopping list endpoints should verify the user is logged in. You can use:
- User ID from `localStorage.getItem('user_data')` (frontend sends as header)
- Or implement JWT tokens (more secure, but more complex)

### Request Format
```javascript
// Headers
{
  'Content-Type': 'application/json',
  'X-User-Id': 'user_id_from_localStorage' // Or use Authorization header with JWT
}

// Body (for POST/PUT)
{
  "name": "List Name",
  "description": "Optional description",
  ...
}
```

### Response Format
```javascript
// Success
{
  "success": true,
  "data": { ... },
  "error": ""
}

// Error
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

---

## 🗄️ DATABASE COLLECTIONS

### users (Already exists)
- Stores user accounts
- Fields: firstName, lastName, email, login, password, etc.

### shoppinglists (Need to create)
- Stores shopping lists
- Fields: name, description, creatorId, code, members, createdAt, updatedAt

### listitems (Need to create)
- Stores items in shopping lists
- Fields: listId, name, quantity, purchased, purchasedBy, purchasedAt, addedBy, createdAt, updatedAt

---