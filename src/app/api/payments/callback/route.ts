import { NextResponse, type NextRequest } from "next/server";
import { settleMoyasarPayment } from "@/lib/payments";

const UUID = /^[0-9a-f-]{36}$/i;

// Moyasar sends the customer back here with ?id=<moyasar payment id>. The status in the
// query string is not trusted: the payment is fetched from Moyasar and checked first.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const pid = q.get("pid");
  const moyasarId = q.get("id");
  const back = (path: string) => NextResponse.redirect(new URL(path, request.url));
  if (!pid || !UUID.test(pid)) return back("/dashboard/billing");
  if (!moyasarId) return back(`/dashboard/pay/${pid}?result=failed`);

  try {
    const r = await settleMoyasarPayment(moyasarId, pid);
    if (r.status === "paid") return back(`/dashboard/pay/${pid}`);
    return back(`/dashboard/pay/${pid}?result=${r.status === "failed" ? "failed" : "pending"}`);
  } catch (e) {
    console.error("payment callback", e);
    return back(`/dashboard/pay/${pid}?result=pending`);
  }
}
