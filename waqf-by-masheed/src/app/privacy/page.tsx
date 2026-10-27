import type { Metadata } from "next";
import { WbPageHead, WqShell } from "@/components/site/parts";
import { LegalBody, PRIVACY } from "@/components/site/legal";
import { getListings } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `${PRIVACY.title} | وقف مَشيد`, description: PRIVACY.lead };

export default async function Page() {
  const open = (await getListings()).filter((l) => l.status === "approved").length;
  return (
    <WqShell openCount={open}>
      <WbPageHead crumbs={[[null, PRIVACY.title]]} title={PRIVACY.title} lead={PRIVACY.lead} />
      <section className="wb-page">
        <div className="wb-wrap"><LegalBody doc={PRIVACY} /></div>
      </section>
    </WqShell>
  );
}
