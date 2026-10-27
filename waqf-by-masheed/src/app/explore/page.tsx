import { redirect } from "next/navigation";

// The old explore page (with sample opportunities) moved to /opportunities; keep the
// old address working for links already shared, including the masheedwaqf.com gateway.
export default function ExplorePage() {
  redirect("/opportunities");
}
