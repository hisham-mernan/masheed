import { NextResponse, type NextRequest } from "next/server";

// Vercel may auto-generate a proxy entry that imports '@supabase/ssr'.
// Providing our own lightweight proxy keeps the build deterministic.
export default function proxy(_request: NextRequest) {
  return NextResponse.next();
}

