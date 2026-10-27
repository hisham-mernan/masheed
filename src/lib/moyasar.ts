// Moyasar REST API — server side only (uses the secret key)
const API = "https://api.moyasar.com/v1";

export type MoyasarPayment = {
  id: string;
  status: string;          // initiated | paid | failed | authorized | captured | refunded | voided
  amount: number;          // halalas
  currency: string;
  description?: string;
  metadata?: Record<string, string> | null;
};

export async function fetchMoyasarPayment(id: string): Promise<MoyasarPayment | null> {
  const key = process.env.MOYASAR_SECRET_KEY;
  if (!key) throw new Error("MOYASAR_SECRET_KEY is not set");
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return null;
  const res = await fetch(`${API}/payments/${id}`, {
    headers: { Authorization: "Basic " + Buffer.from(key + ":").toString("base64") },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as MoyasarPayment;
}
