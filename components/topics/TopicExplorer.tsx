import Link from "next/link";
import { Pagination } from "@/components/common/Pagination";
import { PeriodTopicCard } from "@/components/topics/PeriodTopicCard";
import { TopicCard } from "@/components/topics/TopicCard";
import type { PeriodTopicListItem, Topic } from "@/lib/api/topics";

export type TopicTab = "daily" | "three-day" | "weekly";

const TAB_ORDER: TopicTab[] = ["daily", "three-day", "weekly"];

const TAB_LABELS: Record<TopicTab, string> = {
  daily: "일간",
  "three-day": "3일차",
  weekly: "주간",
};

export function buildTopicsHref(tab: TopicTab, page?: number) {
  const searchParams = new URLSearchParams();
  searchParams.set("tab", tab);

  if (page && page > 1) {
    searchParams.set("page", String(page));
  }

  return `/topics?${searchParams.toString()}`;
}

function getDetailHref(tab: TopicTab, id: number) {
  if (tab === "three-day") {
    return `/three-day-topics/${id}`;
  }

  if (tab === "weekly") {
    return `/weekly-topics/${id}`;
  }

  return `/topics/${id}`;
}

export function TopicExplorer({
  activeTab,
  items,
  page,
  pageSize,
  total,
}: {
  activeTab: TopicTab;
  items: (Topic | PeriodTopicListItem)[];
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section aria-labelledby="topic-archive-list-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border border-slate-200 bg-white px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-semibold text-teal-700">TOPIC ARCHIVE</p>
          <h2
            className="mt-1 text-sm font-bold text-slate-950"
            id="topic-archive-list-heading"
          >
            주요 이슈 목록
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          전체 {total}개 중{" "}
          <strong className="font-semibold text-slate-700">
            {items.length}
          </strong>
          개 표시
        </p>
      </div>

      <div aria-label="이슈 기간 선택" className="flex flex-wrap gap-2" role="tablist">
        {TAB_ORDER.map((tab) => (
          <Link
            aria-current={tab === activeTab ? "page" : undefined}
            className={`inline-flex min-h-11 items-center justify-center border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 ${
              tab === activeTab
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-teal-600 hover:text-teal-800"
            }`}
            href={buildTopicsHref(tab)}
            key={tab}
            role="tab"
          >
            {TAB_LABELS[tab]}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="border border-slate-200 bg-white px-5 py-16 text-center">
          <p className="text-sm font-semibold text-slate-700">
            아직 생성된 주요 이슈가 없습니다.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            새로운 topic summary가 생성되면 이곳에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((topic) =>
            "topic_date" in topic ? (
              <TopicCard key={topic.id} topic={topic} />
            ) : (
              <PeriodTopicCard
                href={getDetailHref(activeTab, topic.id)}
                key={topic.id}
                topic={topic}
              />
            ),
          )}
        </div>
      )}

      <Pagination
        buildHref={(targetPage) => buildTopicsHref(activeTab, targetPage)}
        page={page}
        totalPages={totalPages}
      />
    </section>
  );
}
