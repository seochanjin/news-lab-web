import type { Topic } from "@/lib/api/topics";

function formatTopicDate(topicDate: string) {
  const date = new Date(`${topicDate}T00:00:00+09:00`);

  if (Number.isNaN(date.getTime())) {
    return topicDate;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function TopicCard({ topic }: { topic: Topic }) {
  return (
    <article className="border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <time
          className="text-xs font-semibold text-teal-700"
          dateTime={topic.topic_date}
        >
          {formatTopicDate(topic.topic_date)}
        </time>
        <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500">
          {topic.status}
        </span>
      </div>

      <h3 className="mt-3 text-base font-bold leading-6 text-slate-950">
        {topic.title_ko}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {topic.summary_ko}
      </p>

      {topic.keywords.length > 0 ? (
        <ul aria-label="주요 키워드" className="mt-4 flex flex-wrap gap-2">
          {topic.keywords.map((keyword, index) => (
            <li
              className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
              key={`${topic.id}-${keyword}-${index}`}
            >
              {keyword}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span>
          출처{" "}
          <strong className="font-semibold text-slate-700">
            {topic.source_count}
          </strong>
          곳
        </span>
        <span>
          기사{" "}
          <strong className="font-semibold text-slate-700">
            {topic.article_count}
          </strong>
          건
        </span>
        <span className="sm:ml-auto">
          {topic.provider} · {topic.model}
        </span>
      </div>
    </article>
  );
}
