import Link from "next/link";
import type { PeriodTopicCardItem } from "@/components/home/PeriodTopicSection";

type DailyTopicHighlightsProps = {
  title: string;
  topics: PeriodTopicCardItem[];
  emptyMessage: string;
};

function DailyTopicCard({
  topic,
  priority = false,
}: {
  topic: PeriodTopicCardItem;
  priority?: boolean;
}) {
  return (
    <Link
      aria-label={`${topic.title} 열기`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      href={topic.href}
    >
      <article
        className={`border border-slate-200 bg-white transition group-hover:border-teal-300 group-hover:bg-teal-50/30 group-hover:shadow-sm ${
          priority
            ? "border-l-4 border-l-teal-700 p-5 sm:px-8 sm:py-7"
            : "p-5 sm:p-6"
        }`}
      >
        {topic.periodLabel ? (
          <time
            className="text-xs font-semibold text-teal-700"
            dateTime={topic.dateTime}
          >
            {topic.periodLabel}
          </time>
        ) : null}
        <h2
          className={`mt-2 line-clamp-2 break-words font-bold text-slate-950 group-hover:text-teal-800 ${
            priority ? "text-xl leading-8" : "text-base leading-6"
          }`}
        >
          {topic.title}
        </h2>
        <p
          className={`mt-2 break-words text-sm leading-6 text-slate-600 ${
            priority ? "line-clamp-2 sm:line-clamp-3" : "line-clamp-2"
          }`}
        >
          {topic.summary}
        </p>
      </article>
    </Link>
  );
}

export function DailyTopicHighlights({
  title,
  topics,
  emptyMessage,
}: DailyTopicHighlightsProps) {
  const [leadTopic, ...secondaryTopics] = topics.slice(0, 3);

  return (
    <section className="space-y-4" aria-labelledby="daily-topics-heading">
      <div className="flex items-center justify-between gap-4">
        <h1
          className="text-lg font-bold text-slate-950"
          id="daily-topics-heading"
        >
          {title}
        </h1>
        <Link
          className="shrink-0 text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          href="/topics"
        >
          전체 주요 이슈 보기
        </Link>
      </div>

      {leadTopic ? (
        <div className="space-y-4">
          <DailyTopicCard priority topic={leadTopic} />
          {secondaryTopics.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryTopics.map((topic) => (
                <DailyTopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="border border-slate-200 bg-white px-5 py-8 text-center sm:px-7 sm:py-9">
          <p className="text-sm font-semibold text-slate-700">
            {emptyMessage}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            새로운 주요 이슈가 생성되면 이곳에 표시됩니다.
          </p>
        </div>
      )}
    </section>
  );
}
