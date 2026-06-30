import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicArticleList } from "@/components/topics/TopicArticleList";
import type { PeriodTopicDetail as PeriodTopicDetailData } from "@/lib/api/topics";

function formatDateLabel(dateValue: string | null) {
  if (!dateValue) {
    return "기간 정보 없음";
  }

  const date = new Date(`${dateValue}T00:00:00+09:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function formatPeriodLabel(topic: PeriodTopicDetailData) {
  if (topic.period_start && topic.period_end) {
    return `${formatDateLabel(topic.period_start)} - ${formatDateLabel(topic.period_end)}`;
  }

  return formatDateLabel(topic.topic_date);
}

export function PeriodTopicDetail({
  topic,
  eyebrow,
}: {
  topic: PeriodTopicDetailData;
  eyebrow: string;
}) {
  const periodLabel = formatPeriodLabel(topic);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader activeSection="topics" />

      <PageShell>
        <article className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-teal-700 px-2 py-1 font-semibold text-white">
              {eyebrow}
            </span>
            <time
              className="font-semibold text-teal-700"
              dateTime={topic.topic_date ?? topic.period_end ?? undefined}
            >
              {periodLabel}
            </time>
          </div>

          <h1 className="mt-5 break-words text-2xl font-bold leading-9 text-slate-950 sm:text-3xl sm:leading-10">
            {topic.title_ko}
          </h1>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
            {topic.summary_ko}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-sm">
            <div>
              <dt className="text-xs text-slate-400">출처</dt>
              <dd className="mt-1 font-bold text-slate-800">
                {topic.source_count}곳
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">연결 기사</dt>
              <dd className="mt-1 font-bold text-slate-800">
                {topic.article_count}건
              </dd>
            </div>
          </dl>

          <section aria-labelledby="key-points-heading" className="mt-6">
            <h2
              className="text-sm font-bold text-slate-900"
              id="key-points-heading"
            >
              핵심 포인트
            </h2>
            {topic.key_points.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {topic.key_points.map((point, index) => (
                  <li
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                    key={`${topic.id}-point-${index}`}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-teal-600"
                    />
                    <span className="break-words">{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                등록된 핵심 포인트가 없습니다.
              </p>
            )}
          </section>

          <section aria-labelledby="keywords-heading" className="mt-6">
            <h2
              className="text-sm font-bold text-slate-900"
              id="keywords-heading"
            >
              주요 키워드
            </h2>
            {topic.keywords.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {topic.keywords.map((keyword, index) => (
                  <li
                    className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                    key={`${topic.id}-${keyword}-${index}`}
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                등록된 키워드가 없습니다.
              </p>
            )}
          </section>
        </article>

        <TopicArticleList articles={topic.articles} />
      </PageShell>
    </div>
  );
}
