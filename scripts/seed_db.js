const { Client } = require('pg');

const DB_URL = "postgresql://postgres.qlcjzvcnvxjhjdfqvyud:t3%2B-6yZ%2FGs%25%2FFuW@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function seed() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Seeding initial data...');
    
    // 1. Create a Waqf
    const waqfRes = await client.query(`
      INSERT INTO public.waqfs (name, registration_number, description)
      VALUES ('أوقاف نورة الخيرية', 'WAQ-7788-2024', 'وقف مخصص لدعم الأيتام وتطوير العقارات الوقفية في الرياض')
      RETURNING id;
    `);
    const waqfId = waqfRes.rows[0].id;
    console.log(`- Created Waqf: ${waqfId}`);

    // 2. Create an Asset
    const assetRes = await client.query(`
      INSERT INTO public.assets (waqf_id, name, category, valuation, location, status)
      VALUES ($1, 'برج الفهد السكني', 'real_estate', 25000000, 'الرياض - حي العليا', 'active')
      RETURNING id;
    `, [waqfId]);
    const assetId = assetRes.rows[0].id;
    console.log(`- Created Asset: ${assetId}`);

    // 3. Create a Transaction
    await client.query(`
      INSERT INTO public.transactions (waqf_id, asset_id, amount, type, category, is_yield, description)
      VALUES ($1, $2, 150000, 'income', 'rent', true, 'إيجار الدور الأول - الربع الأول ٢٠٢٦')
    `, [waqfId, assetId]);
    console.log('- Created Transaction');

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await client.end();
  }
}

seed();
