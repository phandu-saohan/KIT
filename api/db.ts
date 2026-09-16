import { neon } from '@neondatabase/serverless';

export function getConnectionString(): string | undefined {
  return (
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL
  );
}

export function isDbConfigured(): boolean {
  return Boolean(getConnectionString());
}

export function getDb() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      'Database connection string not found. Please ensure POSTGRES_URL is configured in your Vercel Project Environment Variables.'
    );
  }
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
