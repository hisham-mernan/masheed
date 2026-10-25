// End-to-end test of Masheed workflows via Supabase Auth + REST (same path the app uses)
const URL = "https://qlcjzvcnvxjhjdfqvyud.supabase.co";
const KEY = "sb_publishable_NeEQs_6Y1OqbrnHgc9yHCw_vjzcHPzZ";
const ts = Date.now();
const ADMIN = `admin-${ts}@masheed-test.dev`;
const VIEWER = `viewer-${ts}@masheed-test.dev`;
const PASS = "Test1234!";

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${URL}${path}`, {
    method,
    headers: {
      apikey: KEY,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(method !== "GET" ? { Prefer: "return=representation" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

async function signup(email, data) {
  return api("/auth/v1/signup", { method: "POST", body: { email, password: PASS, data } });
}
async function login(email) {
  const r = await api("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password: PASS } });
  return r.json.access_token;
}

let failures = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "✅" : "❌"} ${name}${extra ? " — " + extra : ""}`);
  if (!cond) failures++;
}

(async () => {
  // 1. Register waqf admin
  const s = await signup(ADMIN, { full_name: "مدير تجريبي", waqf_name: `وقف الاختبار ${ts}` });
  check("تسجيل مدير جديد + إنشاء وقف تلقائياً", s.status === 200 && s.json.user, JSON.stringify(s.json).slice(0, 200));

  const adminToken = await login(ADMIN);
  check("دخول المدير", !!adminToken);

  // 2. Profile + waqf linked by trigger
  const prof = await api("/rest/v1/profiles?select=*", { token: adminToken });
  const me = prof.json[0];
  check("Trigger أنشأ profile بدور admin مربوط بوقف", me?.role === "admin" && !!me?.waqf_id, JSON.stringify(me));
  const waqfId = me.waqf_id;

  // 3. Add asset
  const asset = await api("/rest/v1/assets", { method: "POST", token: adminToken, body: { waqf_id: waqfId, name: "عمارة الاختبار", category: "real_estate", valuation: 500000, location: "الرياض", status: "active" } });
  check("إضافة أصل (admin)", asset.status === 201, JSON.stringify(asset.json).slice(0, 200));

  // 4. Add two beneficiaries (60/40 of 100 shares)
  const b1 = await api("/rest/v1/beneficiaries", { method: "POST", token: adminToken, body: { waqf_id: waqfId, name: "مستفيد أول", national_id: "1000000001", shares_owned: 60, status: "active", wallet_balance: 0 } });
  const b2 = await api("/rest/v1/beneficiaries", { method: "POST", token: adminToken, body: { waqf_id: waqfId, name: "مستفيد ثاني", national_id: "1000000002", shares_owned: 40, status: "active", wallet_balance: 0 } });
  check("إضافة مستفيدين", b1.status === 201 && b2.status === 201, `${b1.status},${b2.status} ${JSON.stringify(b1.json).slice(0,150)}`);

  // 5. Record income
  const tx = await api("/rest/v1/transactions", { method: "POST", token: adminToken, body: { waqf_id: waqfId, amount: 10000, type: "income", category: "rent", is_yield: true, description: "إيجار شهر 9" } });
  check("تسجيل إيراد 10,000", tx.status === 201, JSON.stringify(tx.json).slice(0, 200));

  // 6. Distribute full yield via RPC
  const dist = await api("/rest/v1/rpc/distribute_yield", { method: "POST", token: adminToken, body: { p_amount: 10000 } });
  check("تنفيذ التوزيع الآلي distribute_yield(10000)", dist.status === 200, JSON.stringify(dist.json).slice(0, 200));
  const distId = dist.json;

  // 7. Verify payouts 6000/4000 and wallets
  const payouts = await api(`/rest/v1/distribution_payouts?distribution_id=eq.${distId}&select=amount,shares_at_time`, { token: adminToken });
  const amounts = (payouts.json || []).map(p => Number(p.amount)).sort((a, b) => a - b);
  check("الأنصبة صحيحة 4000/6000 حسب الأسهم", JSON.stringify(amounts) === "[4000,6000]", JSON.stringify(payouts.json));

  const bens = await api("/rest/v1/beneficiaries?select=name,wallet_balance&order=shares_owned.desc", { token: adminToken });
  const wallets = (bens.json || []).map(b => `${b.name}:${Number(b.wallet_balance)}`);
  check("المحافظ حُدّثت 6000/4000", wallets.join(",") === "مستفيد أول:6000,مستفيد ثاني:4000", wallets.join(","));

  // 8. Ledger entry of type distribution exists
  const ledger = await api("/rest/v1/transactions?type=eq.distribution&select=amount,reference_no", { token: adminToken });
  check("قيد 'distribution' في دفتر الأستاذ", ledger.json?.[0] && Number(ledger.json[0].amount) === 10000, JSON.stringify(ledger.json));

  // 9. Over-distribution must fail
  const over = await api("/rest/v1/rpc/distribute_yield", { method: "POST", token: adminToken, body: { p_amount: 5000 } });
  check("رفض توزيع يتجاوز الريع المتاح", over.status >= 400, JSON.stringify(over.json).slice(0, 200));

  // 10. Audit logs captured everything
  const logs = await api("/rest/v1/audit_logs?select=action,entity_type&order=created_at.desc", { token: adminToken });
  const kinds = new Set((logs.json || []).map(l => `${l.action}:${l.entity_type}`));
  check("سجل المراجعة وثّق assets/transactions/beneficiaries/distributions",
    kinds.has("INSERT:assets") && kinds.has("INSERT:transactions") && kinds.has("INSERT:beneficiaries") && kinds.has("INSERT:distributions"),
    [...kinds].join(" | "));

  // 11. Invite flow: viewer joins same waqf
  const s2 = await signup(VIEWER, { full_name: "قارئ تجريبي", invite_waqf_id: waqfId, role: "viewer" });
  const viewerToken = await login(VIEWER);
  const vprof = await api("/rest/v1/profiles?select=*", { token: viewerToken });
  const vme = (vprof.json || []).find(p => p.full_name === "قارئ تجريبي") || vprof.json[0];
  check("دعوة مستخدم: انضم بنفس الوقف بدور viewer", vme?.role === "viewer" && vme?.waqf_id === waqfId, JSON.stringify(vme));

  // 12. Viewer can read but NOT write
  const vread = await api("/rest/v1/assets?select=name", { token: viewerToken });
  check("viewer يقرأ الأصول", vread.status === 200 && vread.json.length >= 1, JSON.stringify(vread.json));
  const vwrite = await api("/rest/v1/assets", { method: "POST", token: viewerToken, body: { waqf_id: waqfId, name: "محاولة", category: "cash", valuation: 1 } });
  check("viewer ممنوع من الإضافة (RLS role)", vwrite.status >= 400, `${vwrite.status} ${JSON.stringify(vwrite.json).slice(0, 150)}`);
  const vdist = await api("/rest/v1/rpc/distribute_yield", { method: "POST", token: viewerToken, body: { p_amount: 1 } });
  check("viewer ممنوع من التوزيع (RPC role)", vdist.status >= 400, JSON.stringify(vdist.json).slice(0, 150));

  console.log(failures === 0 ? "\n🎉 كل الاختبارات نجحت" : `\n⚠️ فشل ${failures} اختبار`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error("FATAL", e); process.exit(1); });
