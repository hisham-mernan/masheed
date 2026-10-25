const { Client } = require('pg');
const fs = require('fs');

const DB_URL = process.env.DATABASE_URL;
const SQL_FILE = 'supabase/migrations/initial_schema.sql';

async function deploy() {
  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  console.log('Connecting to Supabase via Pooler (6543)...');

  const client = new Client({
    connectionString: DB_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected. Executing migration...');
    
    // Most drivers can run multiple statements in one query call
    await client.query(sql);
    
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();
