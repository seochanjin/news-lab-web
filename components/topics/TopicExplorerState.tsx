import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function TopicExplorerState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader activeSection="topics" />
      <PageShell className="">
        <div className="border border-slate-200 bg-white px-5 py-16 text-center sm:px-7">
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          {action ? <div className="mt-6">{action}</div> : null}
        </div>
      </PageShell>
    </div>
  );
}
