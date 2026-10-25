const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

const client = new Client({
  connectionString,
});

async function applyMigration() {
  try {
    await client.connect();
    console.log('Connected to Supabase database successfully!');
    
    const sqlPath = path.join(__dirname, 'supabase', 'migrations', '02_update_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Applying migration...');
    await client.query(sqlContent);
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await client.end();
  }
}

applyMigration();
