# PostgreSQL Setup Guide - Paint Connect Server

This guide will help you set up PostgreSQL for the Paint Connect server, replacing the previous SQLite setup.

## Prerequisites

- **PostgreSQL**: Version 12 or higher
  - [Download PostgreSQL](https://www.postgresql.org/download/)
  - Or use [PostgreSQL for Windows](https://www.postgresql.org/download/windows/)

## Installation Steps

### Step 1: Install PostgreSQL

#### Windows
1. Download the installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`
5. Accept default settings or customize as needed

#### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

Open PostgreSQL command line (psql) or use pgAdmin:

```sql
-- Create database
CREATE DATABASE paint_connect;

-- Connect to database
\c paint_connect

-- Tables will be automatically created when you start the server
```

#### Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name it `paint_connect`
4. Click "Save"

### Step 3: Configure Environment Variables

Update `server/.env` with your PostgreSQL credentials:

```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paint_connect
DB_USER=postgres
DB_PASSWORD=your-password-here
```

**Replace:**
- `DB_PASSWORD` with your PostgreSQL password set during installation
- `DB_USER` with your PostgreSQL username (default is `postgres`)
- `DB_HOST` if PostgreSQL is on a different machine
- `DB_PORT` if using a non-standard port

### Step 4: Install Dependencies

```bash
cd server
npm install
```

This will install the `pg` package (PostgreSQL client for Node.js).

### Step 5: Start the Server

```bash
npm run dev
```

The server will:
1. Connect to PostgreSQL
2. Automatically create all tables if they don't exist
3. Insert default settings
4. Start listening on `http://localhost:3001`

You should see:
```
Connected to PostgreSQL database
Database schema initialized successfully
Server running at http://localhost:3001
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Make sure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` in `.env`
- On Windows: Open Services and look for "PostgreSQL"
- On Mac/Linux: `brew services start postgresql@15` or `sudo systemctl start postgresql`

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution:**
- Check your `DB_PASSWORD` in `.env`
- Verify PostgreSQL password during installation
- Reset password:
  ```bash
  sudo -u postgres psql
  ALTER USER postgres WITH PASSWORD 'new_password';
  ```

### Database Does Not Exist
```
Error: database "paint_connect" does not exist
```
**Solution:**
```sql
CREATE DATABASE paint_connect;
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:**
- Change `PORT` in `.env`
- Or kill the process using port 3001:
  - Windows: `netstat -ano | findstr :3001` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -i :3001` then `kill -9 <PID>`

## Data Migration from SQLite

If you have existing SQLite data to migrate:

### Using DBeaver or pgAdmin
1. Export SQLite tables as SQL
2. Import into PostgreSQL

### Using Node.js Script
Create `migrate.js`:

```javascript
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const sqliteDb = new sqlite3.Database('./database.db');
const pgPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Copy users
sqliteDb.all('SELECT * FROM users', async (err, rows) => {
  if (err || !rows) return;
  for (const row of rows) {
    await pgPool.query(
      'INSERT INTO users (id, email, password, role) VALUES ($1, $2, $3, $4)',
      [row.id, row.email, row.password, row.role]
    );
  }
  console.log('Users migrated');
});

// Similar for other tables...
```

Run with: `node migrate.js`

## Backup and Restore

### Backup Database
```bash
pg_dump -U postgres -h localhost paint_connect > backup.sql
```

### Restore Database
```bash
psql -U postgres -h localhost paint_connect < backup.sql
```

## Performance Tuning

### Create Indexes for Common Queries
```sql
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
```

### Connection Pool Settings
Adjust in `server/db.js` for high-traffic:
```javascript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
});
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  code TEXT UNIQUE,
  brand TEXT,
  images TEXT,  -- JSON array stored as text
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Settings Table
```sql
CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  whatsapp_number TEXT,
  store_name TEXT DEFAULT 'Paint Connect',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contact Messages Table
```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Differences: SQLite → PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|-----------|
| UUID Generation | Manual with `crypto` | `gen_random_uuid()` |
| Boolean | INTEGER (0/1) | BOOLEAN |
| Parameter Syntax | `?` | `$1, $2, etc` |
| API Style | Callback-based | Promise-based |
| Connection | Direct file | Connection pool |
| Concurrency | Limited | Excellent |
| Data Types | Limited | Rich types |

## Verification

Test if everything is working:

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}

curl http://localhost:3001/api/settings
# Should return settings object
```

## Next Steps

1. ✅ PostgreSQL installed and running
2. ✅ Database created
3. ✅ `.env` configured
4. ✅ Server started with `npm run dev`
5. Frontend should work without changes (API is same)
6. Ready for production deployment

## Support

For PostgreSQL help:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/) - Free database tools
