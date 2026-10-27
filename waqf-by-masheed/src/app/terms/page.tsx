import type { Metadata } from "next";
import { WbPageHead, WqShell } from "@/components/site/parts";
import { LegalBody, TERMS } from "@/components/site/legal";
import { getListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `${TERMS.title} | وقف مَشيد`, description: TERMS.lead };

export default async function Page() {
  const open = (await getListings()).filter((l) => l.status === "approved").length;
  return (
    <WqShell openCount={open}>
      <WbPageHead crumbs={[[null, TERMS.title]]} title={TERMS.title} lead={TERMS.lead} />
      <section className="wb-page">
        <div className="wb-wrap"><LegalBody doc={TERMS} /></div>
      </section>
    </WqShell>
  );
}
