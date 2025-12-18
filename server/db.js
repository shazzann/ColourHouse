import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

/**
 * Railway provides DATABASE_URL
 * Example: postgresql://user:password@host:port/dbname
 * 
 * For local development, use individual env vars:
 * DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */

let pool;

if (process.env.DATABASE_URL) {
  // Railway or production environment
  console.log("📡 Using DATABASE_URL for connection");
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });
} else if (process.env.DB_HOST && process.env.DB_USER) {
  // Local development with individual variables
  console.log("🏠 Using individual database configuration");
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'paint_connect',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  });
} else {
  console.error("❌ No DATABASE_URL or individual database config found");
  console.error("Please set either DATABASE_URL or DB_HOST/DB_USER in .env");
  process.exit(1);
}

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL error", err);
  process.exit(1);
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    // Needed for gen_random_uuid()
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        code TEXT UNIQUE,
        brand TEXT,
        images TEXT,
        stock_quantity INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, category_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        whatsapp_number TEXT,
        store_name TEXT DEFAULT 'Paint Connect',
        phone_number TEXT,
        address TEXT,
        opening_hours TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      INSERT INTO settings (id, whatsapp_number, store_name, phone_number, address, opening_hours)
      VALUES ('default', '', 'Paint Connect', '', '', '')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log("✅ Database schema initialized");
  } catch (err) {
    console.error("❌ Database initialization failed", err);
    process.exit(1);
  }
};

// Run on startup
initializeDatabase();

export default pool;
