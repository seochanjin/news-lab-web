import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicExplorer, type TopicTab } from "@/components/topics/TopicExplorer";
import { getThreeDayTopics, getTopics, getWeeklyTopics } from "@/lib/api/topics";

const PAGE_SIZE = 10;
const VALID_TABS: TopicTab[] = ["daily", "three-day", "weekly"];

function parseTab(value: string | string[] | undefined): TopicTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return VALID_TABS.includes(raw as TopicTab) ? (raw as TopicTab) : "daily";
}

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const tab = parseTab(params.tab);
  const page = parsePage(params.page);

  const response =
    tab === "three-day"
      ? await getThreeDayTopics(page, PAGE_SIZE)
      : tab === "weekly"
        ? await getWeeklyTopics(page, PAGE_SIZE)
        : await getTopics(page, PAGE_SIZE);

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

        <TopicExplorer
          activeTab={tab}
          items={response.items}
          page={response.page}
          pageSize={response.page_size}
          total={response.total}
        />
      </PageShell>
    </div>
  );
}
