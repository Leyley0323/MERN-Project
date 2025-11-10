# SharedCart

A collaborative shopping list application built with the MERN stack that allows families and roommates to create, manage, and share shopping lists together in real-time. Users can add items, edit them inline, and see updates instantly as others contribute to the shared lists.

## Setup

### .env
After pulling the code, create a `.env` file in the `cards` folder (same level as `server.js`).

Create `.env` with the following variables:(I can send you the actual variables on Discord)

```bash
# MongoDB Connection (get from MongoDB Atlas)
MONGODB_URI=your_mongodb_connection_string_here

# SendGrid Configuration (using REST API)
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key_here

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Server Port
PORT=5001

# This is the email address that will appear as "from" in emails (must be verified in SendGrid)
SENDER_EMAIL=your_verified_email@example.com
```

### Backend
```bash
cd cards
npm install
npm start
```
Starts backend on port 5001

### Frontend
```bash
cd cards/frontend
npm install
npm run dev
```
Starts frontend on port 5173