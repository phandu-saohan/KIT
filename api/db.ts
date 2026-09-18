import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

try {
  dotenv.config();
} catch {}

const DEFAULT_NEON_DATABASE_URL =
  'postgresql://neondb_owner:npg_dwRGog4FNqM6@ep-late-salad-awhbmsid-pooler.c-12.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

export function getConnectionString(): string {
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_PRISMA_URL) return process.env.POSTGRES_PRISMA_URL;
  if (process.env.POSTGRES_URL_NON_POOLING) return process.env.POSTGRES_URL_NON_POOLING;
  if (process.env.DATABASE_URL_UNPOOLED) return process.env.DATABASE_URL_UNPOOLED;
  if (process.env.VERCEL_POSTGRES_URL) return process.env.VERCEL_POSTGRES_URL;
  if (process.env.POSTGRES_URL_NO_SSL) return process.env.POSTGRES_URL_NO_SSL;

  if (process.env.POSTGRES_HOST && process.env.POSTGRES_USER && process.env.POSTGRES_PASSWORD) {
    const host = process.env.POSTGRES_HOST;
    const user = encodeURIComponent(process.env.POSTGRES_USER);
    const pass = encodeURIComponent(process.env.POSTGRES_PASSWORD);
    const db = process.env.POSTGRES_DATABASE || 'neondb';
    return `postgres://${user}:${pass}@${host}:5432/${db}?sslmode=require`;
  }

  return DEFAULT_NEON_DATABASE_URL;
}

export function isDbConfigured(): boolean {
  return true;
}

function cleanUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete('channel_binding');
    return u.toString();
  } catch {
    return raw.replace('channel_binding=require&', '').replace('&channel_binding=require', '').replace('?channel_binding=require', '');
  }
}

export function getDb() {
  const connectionString = cleanUrl(getConnectionString());
  return neon(connectionString);
}

let isInitialized = false;

export async function ensureTablesExist() {
  if (isInitialized || !isDbConfigured()) return;
  
  try {
    const sql = getDb();
    
    // Auto-create registrations table
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(255) PRIMARY KEY,
        registration_code VARCHAR(100),
        full_name VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        attendee_type VARCHAR(50),
        workplace VARCHAR(255),
        title VARCHAR(100),
        specialty VARCHAR(255),
        license VARCHAR(100),
        wants_cme BOOLEAN DEFAULT FALSE,
        selected_events JSONB,
        interests JSONB,
        goals JSONB,
        notes TEXT,
        qr_code_url TEXT,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        data JSONB
      );
    `;

    // Auto-create cms_data table
    await sql`
      CREATE TABLE IF NOT EXISTS cms_data (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    isInitialized = true;
  } catch (error) {
    console.error('Error ensuring database tables exist:', error);
    throw error;
  }
}
