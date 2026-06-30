"use client";

import Link from "next/link";
import { useState } from "react";

export type PeriodTopicCardItem = {
  id: number;
  periodLabel?: string;
  dateTime?: string;
  title: string;
  summary: string;
  href: string;
};

type PeriodTopicSectionProps = {
  title: string;
  topics: PeriodTopicCardItem[];
  emptyMessage: string;
};

function clampIndex(index: number, length: number) {
  if (length <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), length - 1);
}

function CompactTopicCard({ topic }: { topic: PeriodTopicCardItem }) {
  return (
    <Link
      aria-label={`${topic.title} 열기`}
      className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
      href={topic.href}
    >
      <article className="border border-slate-200 bg-white p-5 transition group-hover:border-teal-300 group-hover:bg-teal-50/30 group-hover:shadow-sm sm:px-7 sm:py-6">
        <div className="min-w-0">
          {topic.periodLabel ? (
            <time
              className="text-xs font-semibold text-teal-700"
              dateTime={topic.dateTime}
            >
              {topic.periodLabel}
            </time>
          ) : null}
          <h3
            className={`line-clamp-2 break-words text-lg font-bold leading-7 text-slate-950 group-hover:text-teal-800 ${
              topic.periodLabel ? "mt-2" : ""
            }`}
          >
            {topic.title}
          </h3>
          <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-slate-600 sm:line-clamp-3">
            {topic.summary}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function PeriodTopicSection({
  title,
  topics,
  emptyMessage,
}: PeriodTopicSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = topics.length;
  const safeIndex = clampIndex(currentIndex, total);
  const currentTopic = topics[safeIndex];

  const positionLabel = total === 0 ? "" : `${safeIndex + 1} / ${total}`;

  const canMovePrevious = safeIndex > 0;
  const canMoveNext = safeIndex < total - 1;

  return (
    <section className="space-y-4" aria-labelledby={`${title}-heading`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2
            className="text-lg font-bold text-slate-950"
            id={`${title}-heading`}
          >
            {title}
          </h2>
        </div>

        {total > 0 ? (
          <div className="flex shrink-0 items-center justify-end gap-3">
            <p
              aria-label={`${title} 현재 항목 ${safeIndex + 1}개째, 전체 ${total}개`}
              className="min-w-12 text-sm font-semibold text-slate-600"
            >
              {positionLabel}
            </p>
            <div className="flex items-center gap-2">
              <button
                aria-label={`${title} 이전 항목`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-teal-600 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                disabled={!canMovePrevious}
                onClick={() =>
                  setCurrentIndex((index) => clampIndex(index - 1, total))
                }
                type="button"
              >
                이전
              </button>
              <button
                aria-label={`${title} 다음 항목`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-teal-600 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                disabled={!canMoveNext}
                onClick={() =>
                  setCurrentIndex((index) => clampIndex(index + 1, total))
                }
                type="button"
              >
                다음
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {currentTopic ? (
        <CompactTopicCard topic={currentTopic} />
      ) : (
        <div className="border border-slate-200 bg-white px-5 py-8 text-center sm:px-7 sm:py-9">
          <p className="text-sm font-semibold text-slate-700">
            {emptyMessage}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            새로운 뉴스 흐름이 생성되면 이곳에 표시됩니다.
          </p>
        </div>
      )}
    </section>
  );
}
