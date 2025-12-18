# Local Database Setup Guide

This project has been migrated from Supabase to a local API server with SQLite database.

## Prerequisites

- Node.js 18+ installed
- npm or similar package manager

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
cd ..
```

### 2. Start the Backend Server

Open a terminal and run:
```bash
cd server
npm run dev
```

The server will start on `http://localhost:3001`

You should see: `Server running at http://localhost:3001`

### 3. Start the Frontend Development Server

In another terminal, run:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Key Changes from Supabase

### Authentication
- **Old:** Supabase Auth with email/password
- **New:** Local JWT-based authentication
- Tokens are stored in localStorage with key `auth_token`

### Database
- **Old:** Supabase PostgreSQL
- **New:** SQLite database (`server/database.db`)
- Tables: users, products, categories, product_categories, contact_messages, settings, user_roles

### File Storage
- **Old:** Supabase Storage
- **New:** Local file system (`server/uploads/`)
- Images are served via `/uploads/` endpoint

### API Endpoints
All API calls now go to `http://localhost:3001/api/`:
- `/api/auth/signup` - Register new user
- `/api/auth/signin` - Login
- `/api/auth/session` - Get current session
- `/api/products` - Get/create products
- `/api/categories` - Get/create categories
- `/api/settings` - Get/update settings
- `/api/messages` - Contact messages

## Creating Admin Users

To create an admin user, you need to directly modify the database. Use SQLite client or:

```bash
cd server
# Use SQLite shell
sqlite3 database.db
```

Then run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM users WHERE email = 'your-email@example.com';
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend (server/.env)
```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` in production!

## Troubleshooting

### API Not Responding
- Make sure backend server is running on port 3001
- Check if you're hitting the right API_BASE URL
- Look at browser console for CORS errors

### Database Lock
- If you get database is locked error, ensure only one server instance is running
- Delete `server/database.db` to reset (all data will be lost)

### Image Upload Issues
- Ensure `server/uploads/` directory exists
- Check file permissions on the uploads folder

## Database Schema

All tables are automatically created on first run. Check `server/db.js` for schema.

Key tables:
- **users**: User accounts and roles
- **products**: Product information
- **categories**: Product categories
- **product_categories**: Junction table for product-category relationships
- **contact_messages**: Contact form submissions
- **settings**: App settings (WhatsApp number, etc.)
