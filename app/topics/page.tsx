import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicExplorer } from "@/components/topics/TopicExplorer";
import { getTopics } from "@/lib/api/topics";

export default async function TopicsPage() {
  const response = await getTopics(1, 50);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader activeSection="topics" />

      <PageShell>
        <section className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-xs font-semibold text-teal-700">TOPIC ARCHIVE</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            주요 이슈 아카이브
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            날짜별로 축적된 주요 이슈를 살펴보고, 각 이슈의 상세 요약과 연결
            기사를 확인할 수 있습니다.
          </p>
        </section>

        <TopicExplorer initialTopics={response.items} total={response.total} />
      </PageShell>
    </div>
  );
}
