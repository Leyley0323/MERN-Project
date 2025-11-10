# SharedCart

A collaborative shopping list application built with the MERN stack that allows families and roommates to create, manage, and share shopping lists together in real-time. Users can add items, edit them inline, and see updates instantly as others contribute to the shared lists.

## Setup

### .env
After pulling the code, create a `.env` file in the `cards` folder (same level as `server.js`).

**⚠️ IMPORTANT: Never commit your `.env` file to Git! It contains sensitive information.**

Create `.env` with the following variables:

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

**How to get these values:**
- **MONGODB_URI**: Get from MongoDB Atlas → Connect → Connection string
- **EMAIL_PASSWORD**: Get from SendGrid → Settings → API Keys → Create API Key
- **SENDER_EMAIL**: Use an email address you've verified in SendGrid
- **FRONTEND_URL**: Use `http://localhost:5173` for local development, or your production URL

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