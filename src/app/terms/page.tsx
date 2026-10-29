import { SysShell, WbPageHead } from "@/components/system-site/parts";
import { sysMeta } from "@/lib/seo";
import { LegalBody, LegalToc, TERMS } from "@/components/system-site/legal";

export const metadata = sysMeta("/terms", `${TERMS.title} | نظام مَشيد`, TERMS.lead);

export default function Page() {
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, TERMS.title]]} title={TERMS.title} lead={TERMS.lead} aside={<LegalToc doc={TERMS} />} />
      <section className="wb-page">
        <div className="wb-wrap"><LegalBody doc={TERMS} /></div>
      </section>
    </SysShell>
  );
}
