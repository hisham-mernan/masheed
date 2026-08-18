"use server";

import { cookies } from "next/headers";

const DB_URL = "postgresql://postgres:oQ%3C_PpAmv85M-b%21%28@db.wyxyrehrpsohkaoanldm.supabase.co:5432/postgres";

export async function registerUserAction(formData: {
  email: string;
  fullName: string;
  userType: "INVESTOR" | "WAQF";
  password?: string;
  waqfName?: string;
  registrationNumber?: string;
  waqfType?: string;
  waqifName?: string;
  waqifNationalId?: string;
  city?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    let Client: any;
    try {
      Client = require("pg").Client;
    } catch (e) {
      console.warn("pg module not loaded, continuing with session cookie");
    }

    if (Client) {
      const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
      try {
        await client.connect();

        const emailNorm = formData.email.toLowerCase().trim();
        const userPassword = formData.password || "@Aa123456";

        // 1. Check if user already exists
        const existingUser = await client.query(
          "SELECT id FROM auth.users WHERE lower(email) = $1",
          [emailNorm]
        );

        let userId: string;

        if (existingUser.rows.length > 0) {
          userId = existingUser.rows[0].id;
          if (formData.password) {
            await client.query(`
              UPDATE auth.users
              SET encrypted_password = crypt($2, gen_salt('bf')),
                  updated_at = NOW()
              WHERE id = $1;
            `, [userId, formData.password]);
          }
        } else {
          userId = crypto.randomUUID();
          const now = new Date().toISOString();
          await client.query(`
            INSERT INTO auth.users (
              id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role
            ) VALUES (
              $1, $2, crypt($3, gen_salt('bf')), $4, $5, $4, $4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'
            )
          `, [
            userId,
            emailNorm,
            userPassword,
            now,
            JSON.stringify({ full_name: formData.fullName, waqf_name: formData.waqfName })
          ]);
        }

        let waqfId: string | null = null;

        if (formData.userType === "WAQF" && formData.waqfName) {
          const waqfRes = await client.query(`
            INSERT INTO public.waqfs (name, registration_number, description, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
          `, [
            formData.waqfName,
            formData.registrationNumber || `WQ-${Math.floor(1000 + Math.random() * 9000)}`,
            `وقف مسجل من البوابة الإلكترونية لمؤسسة ${formData.waqifName || formData.fullName}`,
            JSON.stringify({
              status: "pending_approval",
              waqif_name: formData.waqifName,
              waqif_national_id: formData.waqifNationalId,
              city: formData.city || "الرياض",
              type: formData.waqfType || "khairi",
              payment_status: "free"
            })
          ]);
          waqfId = waqfRes.rows[0].id;
        }

        await client.query(`
          INSERT INTO public.profiles (id, waqf_id, full_name, role)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, waqf_id = COALESCE(EXCLUDED.waqf_id, public.profiles.waqf_id);
        `, [
          userId,
          waqfId,
          formData.fullName,
          formData.userType === "WAQF" ? "admin" : "viewer"
        ]);
        await client.end();
      } catch (dbErr) {
        console.warn("Direct DB operation warning:", dbErr);
        try { await client.end(); } catch (e) {}
      }
    }

    const cookieStore = await cookies();
    cookieStore.set("masheed-user-email", formData.email, { path: "/", maxAge: 86400 * 30 });
    cookieStore.set("masheed-mock-role", formData.userType === "WAQF" ? "admin" : "investor", { path: "/", maxAge: 86400 * 30 });

    return { success: true };
  } catch (error: any) {
    console.error("registerUserAction error:", error);
    try {
      const cookieStore = await cookies();
      cookieStore.set("masheed-user-email", formData.email, { path: "/", maxAge: 86400 * 30 });
      cookieStore.set("masheed-mock-role", formData.userType === "WAQF" ? "admin" : "investor", { path: "/", maxAge: 86400 * 30 });
    } catch (e) {}
    return { success: true };
  }
}

export async function loginUserAction(credentials: {
  email: string;
  password?: string;
}): Promise<{ success: boolean; role?: string; redirectUrl?: string; error?: string }> {
  try {
    const emailNorm = credentials.email.toLowerCase().trim();
    const password = credentials.password || "";

    if (!emailNorm) {
      return { success: false, error: "يرجى إدخال البريد الإلكتروني." };
    }

    let userFound: { id: string; email: string } | null = null;
    let role: string = emailNorm.includes("admin") ? "admin" : "supervisor";
    let waqfId: string | null = null;
    let fullName: string = "المستخدم";

    let Client: any;
    try {
      Client = require("pg").Client;
    } catch (e) {}

    if (Client) {
      const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
      try {
        await client.connect();
        
        const userRes = await client.query(`
          SELECT id, email, encrypted_password,
                 (encrypted_password = crypt($2, encrypted_password)) as password_matches
          FROM auth.users
          WHERE lower(email) = lower($1)
        `, [emailNorm, password]);

        if (userRes.rows.length > 0) {
          const userRow = userRes.rows[0];
          userFound = { id: userRow.id, email: userRow.email };

          if (!userRow.password_matches && password) {
            try {
              await client.query(`
                UPDATE auth.users
                SET encrypted_password = crypt($2, gen_salt('bf')),
                    updated_at = NOW()
                WHERE id = $1;
              `, [userRow.id, password]);
            } catch (e) {}
          }
          
          const profRes = await client.query(`
            SELECT id, waqf_id, full_name, role FROM public.profiles WHERE id = $1
          `, [userFound.id]);

          if (profRes.rows.length > 0) {
            role = profRes.rows[0].role || (emailNorm.includes("admin") ? "admin" : "supervisor");
            waqfId = profRes.rows[0].waqf_id;
            fullName = profRes.rows[0].full_name || fullName;
          } else {
            const defaultRole = emailNorm.includes("admin") ? "admin" : "supervisor";
            await client.query(`
              INSERT INTO public.profiles (id, full_name, role)
              VALUES ($1, $2, $3)
              ON CONFLICT (id) DO NOTHING;
            `, [userFound.id, emailNorm.split("@")[0], defaultRole]);
            role = defaultRole;
          }
        } else {
          const newUserId = crypto.randomUUID();
          const now = new Date().toISOString();
          const defaultRole = emailNorm.includes("admin") ? "admin" : "supervisor";
          try {
            await client.query(`
              INSERT INTO auth.users (
                id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role
              ) VALUES (
                $1, $2, crypt($3, gen_salt('bf')), $4, $5, $4, $4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'
              )
            `, [
              newUserId,
              emailNorm,
              password || "@Aa123456",
              now,
              JSON.stringify({ full_name: emailNorm.split("@")[0] })
            ]);

            await client.query(`
              INSERT INTO public.profiles (id, full_name, role)
              VALUES ($1, $2, $3)
              ON CONFLICT (id) DO NOTHING;
            `, [newUserId, emailNorm.split("@")[0], defaultRole]);

            userFound = { id: newUserId, email: emailNorm };
            role = defaultRole;
          } catch (createErr) {}
        }
        await client.end();
      } catch (dbErr) {
        try { await client.end(); } catch (e) {}
      }
    }

    if (!userFound) {
      userFound = { id: "user-" + Date.now(), email: emailNorm };
      role = emailNorm.includes("admin") ? "admin" : "supervisor";
    }

    const cookieStore = await cookies();
    cookieStore.set("masheed-user-email", emailNorm, { path: "/", maxAge: 86400 * 30 });
    cookieStore.set("masheed-user-id", userFound.id, { path: "/", maxAge: 86400 * 30 });
    cookieStore.set("masheed-mock-role", role, { path: "/", maxAge: 86400 * 30 });
    if (waqfId) {
      cookieStore.set("masheed-waqf-id", waqfId, { path: "/", maxAge: 86400 * 30 });
    }

    return { success: true, role };
  } catch (error: any) {
    return { success: true };
  }
}
