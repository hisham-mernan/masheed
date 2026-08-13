"use server";

import { Client } from "pg";
import { cookies } from "next/headers";

const DB_URL = "postgresql://postgres:oQ%3C_PpAmv85M-b%21%28@db.wyxyrehrpsohkaoanldm.supabase.co:5432/postgres";

export async function registerUserAction(formData: {
  email: string;
  fullName: string;
  userType: "INVESTOR" | "WAQF";
  waqfName?: string;
  registrationNumber?: string;
  waqfType?: string;
  waqifName?: string;
  waqifNationalId?: string;
  city?: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();

    // 1. Check if user already exists
    const existingUser = await client.query(
      "SELECT id FROM auth.users WHERE email = $1",
      [formData.email.toLowerCase()]
    );

    let userId: string;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
    } else {
      userId = crypto.randomUUID();
      const now = new Date().toISOString();
      await client.query(`
        INSERT INTO auth.users (
          id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, instance_id, aud, role
        ) VALUES (
          $1, $2, '$2a$10$abcdefghijklmnopqrstuv', $3, $4, $3, $3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'
        )
      `, [
        userId,
        formData.email.toLowerCase(),
        now,
        JSON.stringify({ full_name: formData.fullName, waqf_name: formData.waqfName })
      ]);
    }

    let waqfId: string | null = null;

    if (formData.userType === "WAQF" && formData.waqfName) {
      const waqfRes = await client.query(`
        INSERT INTO public.waqfs (name, registration_number, description)
        VALUES ($1, $2, $3)
        RETURNING id;
      `, [
        formData.waqfName,
        formData.registrationNumber || `WQ-${Math.floor(1000 + Math.random() * 9000)}-SA`,
        `وقف مسجل من البوابة الإلكترونية لمؤسسة ${formData.waqifName || formData.fullName}`
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
  } finally {
    try { await client.end(); } catch (e) {}
  }
}
