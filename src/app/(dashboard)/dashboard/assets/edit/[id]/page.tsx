import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import EditAssetForm from "@/components/dashboard/EditAssetForm";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!["admin", "supervisor"].includes(profile?.role || "")) redirect("/dashboard/assets");

  const { data: asset } = await supabase.from("assets").select("*").eq("id", id).single();
  if (!asset) notFound();

  return (
    <div className="fade-in" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>تعديل الأصل: {asset.name}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>تحديث بيانات الأصل — كل تعديل يُوثق في سجل المراجعة.</p>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <EditAssetForm asset={asset} />
      </div>
    </div>
  );
}
