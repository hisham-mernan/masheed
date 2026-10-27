import type { Metadata } from "next";
import { SysShell, WbPageHead } from "@/components/system-site/parts";
import { LegalBody, TERMS } from "@/components/system-site/legal";

export const metadata: Metadata = { title: `${TERMS.title} | نظام مَشيد`, description: TERMS.lead };

export default function Page() {
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, TERMS.title]]} title={TERMS.title} lead={TERMS.lead} />
      <section className="wb-page">
        <div className="wb-wrap"><LegalBody doc={TERMS} /></div>
      </section>
    </SysShell>
  );
}
