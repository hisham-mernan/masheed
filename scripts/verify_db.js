const { Client } = require('pg');

const DB_URL = "postgresql://postgres.qlcjzvcnvxjhjdfqvyud:t3%2B-6yZ%2FGs%25%2FFuW@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function verify() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Verifying tables in public schema...');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables found:');
    res.rows.forEach(row => console.log(`- ${row.table_name}`));

    console.log('\nVerifying enums...');
    const enums = await client.query(`
      SELECT t.typname as enum_name
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      GROUP BY t.typname;
    `);
    res.rows.forEach(row => console.log(`- ${row.enum_name || ''}`));

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await client.end();
  }
}

verify();
