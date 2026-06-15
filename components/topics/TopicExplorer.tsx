"use client";

import { useMemo, useState } from "react";
import { TopicCard } from "@/components/topics/TopicCard";
import type { Topic } from "@/lib/api/topics";

const ALL_DATES = "all";

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

function matchesSearch(topic: Topic, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  return [
    topic.title_ko,
    topic.summary_ko,
    topic.topic_date,
    ...topic.keywords,
  ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
}

export function TopicExplorer({
  initialTopics,
  total,
}: {
  initialTopics: Topic[];
  total: number;
}) {
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(ALL_DATES);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dates = useMemo(
    () =>
      Array.from(new Set(initialTopics.map((topic) => topic.topic_date))).sort(
        (left, right) => right.localeCompare(left),
      ),
    [initialTopics],
  );

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredTopics = initialTopics.filter(
    (topic) =>
      matchesSearch(topic, normalizedQuery) &&
      (selectedDate === ALL_DATES || topic.topic_date === selectedDate),
  );
  const hasFilters = normalizedQuery.length > 0 || selectedDate !== ALL_DATES;
  const activeFilters = [
    normalizedQuery ? `검색어: ${query.trim()}` : null,
    selectedDate !== ALL_DATES
      ? `이슈 날짜: ${formatTopicDate(selectedDate)}`
      : null,
  ].filter((filter): filter is string => filter !== null);

  function resetFilters() {
    setQuery("");
    setSelectedDate(ALL_DATES);
  }

  if (initialTopics.length === 0) {
    return (
      <div className="border border-slate-200 bg-white px-5 py-16 text-center">
        <p className="text-sm font-semibold text-slate-700">
          아직 생성된 주요 이슈가 없습니다.
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          새로운 daily topic summary가 생성되면 이곳에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="topic-filters-heading"
        className="border border-slate-200 bg-white px-4 py-4 sm:px-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              className="text-sm font-bold text-slate-950"
              id="topic-filters-heading"
            >
              아카이브 필터
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              자동 생성된 주요 이슈 목록 안에서 적용됩니다.
            </p>
          </div>
          <button
            aria-controls="topic-filter-panel"
            aria-expanded={filtersOpen}
            className="border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            onClick={() => setFiltersOpen((isOpen) => !isOpen)}
            type="button"
          >
            {filtersOpen ? "필터 닫기" : "필터 열기"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {hasFilters ? "필터 적용 중" : "전체 이슈"}
            </span>
            {activeFilters.map((filter) => (
              <span
                className="border border-teal-100 bg-teal-50 px-2 py-1 text-teal-800"
                key={filter}
              >
                {filter}
              </span>
            ))}
          </div>
          <p aria-live="polite" className="text-xs text-slate-500" role="status">
            전체 {total}개 중{" "}
            <strong className="font-semibold text-slate-700">
              {filteredTopics.length}
            </strong>
            개 표시
          </p>
        </div>

        {filtersOpen ? (
          <div
            className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(0,1fr)_220px_auto] sm:items-end"
            id="topic-filter-panel"
          >
            <div>
              <label
                className="block text-xs font-semibold text-slate-600"
                htmlFor="topic-search"
              >
                주요 이슈 검색
              </label>
              <input
                className="mt-2 w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600"
                id="topic-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이슈 제목, 요약, 키워드 검색"
                type="search"
                value={query}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-600"
                htmlFor="topic-date"
              >
                이슈 날짜
              </label>
              <select
                className="mt-2 w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-600"
                id="topic-date"
                onChange={(event) => setSelectedDate(event.target.value)}
                value={selectedDate}
              >
                <option value={ALL_DATES}>전체 날짜</option>
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {formatTopicDate(date)}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-600 hover:text-teal-800 disabled:cursor-not-allowed disabled:text-slate-300"
              disabled={!hasFilters}
              onClick={resetFilters}
              type="button"
            >
              필터 초기화
            </button>
          </div>
        ) : null}
      </section>

      {filteredTopics.length > 0 ? (
        <section aria-label="필터된 주요 이슈 목록">
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredTopics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        </section>
      ) : (
        <div className="border border-slate-200 bg-white px-5 py-16 text-center">
          <p className="text-sm font-semibold text-slate-700">
            조건에 맞는 주요 이슈가 없습니다.
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            검색어나 날짜 필터를 조정해보세요.
          </p>
          <button
            className="mt-5 bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            onClick={resetFilters}
            type="button"
          >
            전체 주요 이슈 보기
          </button>
        </div>
      )}
    </div>
  );
}
