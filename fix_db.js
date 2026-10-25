const { Client } = require('pg');
const fs = require('fs');

async function fix() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const dbUrlLine = envFile.split('\n').find(line => line.startsWith('DATABASE_URL='));
  const dbUrl = dbUrlLine.split('DATABASE_URL=')[1].trim();

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log("Connected to DB.");

  // 1. Get a user who has no waqf_id
  const { rows: profiles } = await client.query(`SELECT id FROM public.profiles WHERE waqf_id IS NULL LIMIT 1;`);
  
  if (profiles.length > 0) {
    console.log("Found profile with NULL waqf_id:", profiles[0].id);
    
    // 2. Check if there's any waqf we can link to
    const { rows: waqfs } = await client.query(`SELECT id FROM public.waqfs LIMIT 1;`);
    let waqfId;
    
    if (waqfs.length > 0) {
      waqfId = waqfs[0].id;
      console.log("Found existing Waqf:", waqfId);
    } else {
      const { rows: newWaqf } = await client.query(`INSERT INTO public.waqfs (name) VALUES ('وقف تجريبي (Demo)') RETURNING id;`);
      waqfId = newWaqf[0].id;
      console.log("Created new Waqf:", waqfId);
    }
    
    // 3. Update profile
    await client.query(`UPDATE public.profiles SET waqf_id = $1 WHERE id = $2;`, [waqfId, profiles[0].id]);
    console.log("Successfully updated profile with waqf_id!");
    
    // 4. Update the user role to admin just in case
    await client.query(`UPDATE public.profiles SET role = 'admin' WHERE id = $1;`, [profiles[0].id]);
  } else {
    console.log("All profiles have a waqf_id.");
    
    // If the user's profile is entirely missing, we could try to create one
    const { rows: users } = await client.query(`SELECT id FROM auth.users LIMIT 1;`);
    if (users.length > 0) {
       console.log("Auth user exists:", users[0].id);
       // check if profile exists
       const { rows: existingProfile } = await client.query(`SELECT id FROM public.profiles WHERE id = $1`, [users[0].id]);
       if (existingProfile.length === 0) {
           console.log("Profile missing! Creating it.");
           const { rows: waqfs } = await client.query(`SELECT id FROM public.waqfs LIMIT 1;`);
           let waqfId = waqfs.length > 0 ? waqfs[0].id : null;
           if (!waqfId) {
               const { rows: newWaqf } = await client.query(`INSERT INTO public.waqfs (name) VALUES ('وقف تجريبي (Demo)') RETURNING id;`);
               waqfId = newWaqf[0].id;
           }
           await client.query(`INSERT INTO public.profiles (id, waqf_id, role, full_name) VALUES ($1, $2, 'admin', 'مستخدم ديمو')`, [users[0].id, waqfId]);
           console.log("Profile created and linked!");
       }
    }
  }

  await client.end();
}

fix().catch(console.error);
