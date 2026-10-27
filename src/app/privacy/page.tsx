import type { Metadata } from "next";
import { SysShell, WbPageHead } from "@/components/system-site/parts";
import { LegalBody, PRIVACY } from "@/components/system-site/legal";

export const metadata: Metadata = { title: `${PRIVACY.title} | نظام مَشيد`, description: PRIVACY.lead };

export default function Page() {
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, PRIVACY.title]]} title={PRIVACY.title} lead={PRIVACY.lead} />
      <section className="wb-page">
        <div className="wb-wrap"><LegalBody doc={PRIVACY} /></div>
      </section>
    </SysShell>
  );
}
