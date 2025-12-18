# 🎨 Paint Connect - Migration Complete!

Your project has been successfully migrated from **Supabase** to a **local database with Node.js API server**.

## What Changed

### ❌ Removed
- Supabase JavaScript client (`@supabase/supabase-js`)
- Supabase authentication
- Supabase PostgreSQL database
- Supabase storage buckets

### ✅ Added
- Express.js backend server
- SQLite database
- JWT-based authentication
- Local file storage for images
- RESTful API endpoints

## Quick Start

### Installation

Run the installation script (Windows):
```bash
install.bat
```

Or run manually:
```bash
npm install
cd server && npm install && cd ..
```

### Starting the Application

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
Expected output: `Server running at http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Expected output: Frontend opens at `http://localhost:5173`

## File Structure Changes

```
project/
├── server/                    # NEW - Backend API server
│   ├── index.js              # Entry point
│   ├── db.js                 # SQLite database setup
│   ├── package.json
│   ├── .env                  # Server configuration
│   ├── database.db           # SQLite database (auto-created)
│   ├── uploads/              # Image storage
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   └── routes/
│       ├── auth.js           # Auth endpoints
│       ├── products.js       # Product endpoints
│       ├── categories.js     # Category endpoints
│       ├── settings.js       # Settings endpoints
│       ├── messages.js       # Contact message endpoints
│       └── uploads.js        # Image upload endpoints
│
├── src/
│   ├── lib/
│   │   ├── api.ts            # NEW - Fetch-based API client
│   │   ├── supabase.ts       # DEPRECATED - Compatibility wrapper
│   │   ├── contactMessages.ts # Updated to use new API
│   │   └── imageUpload.ts    # Updated to use local storage
│   │
│   ├── pages/
│   │   ├── Auth.tsx          # Updated auth flow
│   │   ├── Products.tsx      # Updated product display
│   │   ├── ProductDetail.tsx # Updated image handling
│   │   ├── Contact.tsx       # Updated form submission
│   │   └── admin/
│   │       └── AdminDashboard.tsx # Updated auth check
│   │
│   └── components/admin/
│       ├── ProductDialog.tsx     # Updated product creation
│       ├── ProductsTab.tsx       # Updated product list
│       ├── CategoriesTab.tsx     # Updated category management
│       ├── SettingsTab.tsx       # Updated settings
│       └── MessagesTab.tsx       # Updated messages list
│
├── .env                      # Updated - removed Supabase vars
├── LOCAL_DATABASE_SETUP.md   # Setup guide
└── package.json              # Removed Supabase dependency
```

## Migration Details

### API Endpoints

All endpoints require authentication (JWT token in Authorization header) except signup, signin, getProducts, and getCategories.

#### Auth
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/session` - Get current session

#### Products
- `GET /api/products` - Get products with pagination/search/filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

#### Settings
- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update settings (admin)

#### Messages
- `POST /api/messages` - Create contact message
- `GET /api/messages` - Get all messages (admin)
- `PUT /api/messages/:id/read` - Mark as read (admin)
- `DELETE /api/messages/:id` - Delete message (admin)

#### Image Upload
- `POST /uploads/upload` - Upload image
- `GET /uploads/:filename` - Get image
- `DELETE /uploads/:filename` - Delete image

### Authentication Flow

1. User signs up/in via `/api/auth/signup` or `/api/auth/signin`
2. Server returns JWT token
3. Token stored in localStorage as `auth_token`
4. All subsequent requests include `Authorization: Bearer <token>` header
5. Server validates token on protected endpoints

### Making Admin Users

Edit the SQLite database directly:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM users WHERE email = 'your-email@example.com';
```

Or use SQLite GUI tool to edit `server/database.db`:
- Update users table: set `role = 'admin'`
- Insert into user_roles: `(user_id, 'admin')`

### Image Handling

- Images uploaded via `/uploads/upload` endpoint
- Stored in `server/uploads/` directory
- Served via `/uploads/:filename` URL
- Automatically cleaned up when product is deleted
- Max file size: 5MB

## Data Migration

**Important:** Your old Supabase data is not automatically migrated. You'll need to:

1. Export data from Supabase (if you have access)
2. Create a migration script to insert into SQLite
3. Or manually re-create data through the UI

For now, start with a clean database.

## Production Deployment

**⚠️ Security Notes:**
- Change `JWT_SECRET` in `server/.env` to a strong random value
- Use HTTPS in production
- Store `.env` securely (never commit to Git)
- Implement rate limiting for API endpoints
- Add CORS restrictions for specific domains

## Troubleshooting

### "Cannot find module" errors
```bash
# Install dependencies in both root and server
npm install
cd server && npm install && cd ..
```

### "Port already in use"
```bash
# Change PORT in server/.env
PORT=3002  # Use different port
```

### "Database locked"
```bash
# Only one server instance can access database at a time
# Kill other Node processes and restart
```

### "CORS errors"
```bash
# Frontend sends requests to http://localhost:3001/api
# Verify API_URL in .env matches your server port
REACT_APP_API_URL=http://localhost:3001/api
```

### Images not uploading
```bash
# Ensure server/uploads directory exists and is writable
# Check server logs for specific error message
```

## Files for Reference

- **Setup Guide:** `LOCAL_DATABASE_SETUP.md`
- **Server Code:** `server/` directory
- **API Client:** `src/lib/api.ts`
- **Database Schema:** `server/db.js`

## Next Steps

1. ✅ Start both servers
2. Test sign up / sign in flow
3. Create admin user in database
4. Add products and categories
5. Test contact form
6. Verify image uploads work

## Support

Check the following files for more details:
- `LOCAL_DATABASE_SETUP.md` - Detailed setup guide
- `server/db.js` - Database schema
- `src/lib/api.ts` - API client implementation

Happy coding! 🚀
