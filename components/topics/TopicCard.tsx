import Link from "next/link";
export type TopicCardData = {
  id: number;
  topic_date: string | null;
  title_ko: string;
  summary_ko: string;
  keywords: string[];
  source_count: number;
  article_count: number;
};

function formatTopicDate(topicDate: string | null) {
  if (!topicDate) {
    return "날짜 미정";
  }

  const date = new Date(`${topicDate}T00:00:00+09:00`);

  if (Number.isNaN(date.getTime())) {
    return topicDate;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeZone: "Asia/Seoul",
  }).format(date);
}

export function TopicCard({ topic }: { topic: TopicCardData }) {
  return (
    <Link
      aria-label={`주요 이슈 상세 보기: ${topic.title_ko}`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      href={`/topics/${topic.id}`}
    >
      <article className="border border-slate-200 bg-white p-5 transition group-hover:border-teal-300 group-hover:bg-teal-50/30">
        <div className="flex flex-wrap items-center gap-2">
          <time
            className="text-xs font-semibold text-teal-700"
            dateTime={topic.topic_date ?? undefined}
          >
            {formatTopicDate(topic.topic_date)}
          </time>
        </div>

        <h3 className="mt-3 text-base font-bold leading-6 text-slate-950 group-hover:text-teal-800">
          {topic.title_ko}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {topic.summary_ko}
        </p>

        {topic.keywords.length > 0 ? (
          <ul aria-label="주요 키워드" className="mt-4 flex flex-wrap gap-2">
            {topic.keywords.slice(0, 3).map((keyword, index) => (
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
        </div>
      </article>
    </Link>
  );
}
