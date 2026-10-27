import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { settleMoyasarPayment } from "@/lib/payments";

// Moyasar webhook: settles payments whose customer never came back to the callback
// (closed tab, lost connection). The payment is still re-fetched from Moyasar.
export async function POST(request: NextRequest) {
  const secret = process.env.MOYASAR_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 });
  const body = (await request.json().catch(() => null)) as { secret_token?: string; data?: { id?: string } } | null;
  const token = Buffer.from(String(body?.secret_token ?? ""));
  const want = Buffer.from(secret);
  if (token.length !== want.length || !timingSafeEqual(token, want)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!body?.data?.id) return NextResponse.json({ ok: true });
  try {
    const r = await settleMoyasarPayment(body.data.id);
    return NextResponse.json({ ok: true, status: r.status });
  } catch (e) {
    console.error("payment webhook", e);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
}
