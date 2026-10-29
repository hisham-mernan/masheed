import { SysShell, WbPageHead } from "@/components/system-site/parts";
import { sysMeta } from "@/lib/seo";
import { LegalBody, LegalToc, PRIVACY } from "@/components/system-site/legal";

export const metadata = sysMeta("/privacy", `${PRIVACY.title} | نظام مَشيد`, PRIVACY.lead);

export default function Page() {
  return (
    <SysShell>
      <WbPageHead crumbs={[[null, PRIVACY.title]]} title={PRIVACY.title} lead={PRIVACY.lead} aside={<LegalToc doc={PRIVACY} />} />
      <section className="wb-page">
        <div className="wb-wrap"><LegalBody doc={PRIVACY} /></div>
      </section>
    </SysShell>
  );
}
