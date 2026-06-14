import { SiteHeader } from "@/components/layout/SiteHeader";

export function TopicDetailState({
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
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="border border-slate-200 bg-white px-5 py-16 text-center sm:px-7">
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          {action ? <div className="mt-6">{action}</div> : null}
        </div>
      </main>
    </div>
  );
}
