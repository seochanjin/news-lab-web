import { Suspense } from "react";
import {
  PeriodTopicHome,
  PeriodTopicHomeLoading,
  type PeriodTopicSectionData,
} from "@/components/home/PeriodTopicHome";
import type { PeriodTopicCardItem } from "@/components/home/PeriodTopicSection";
import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import {
  getHomeTopics,
  getThreeDayTopicsHome,
  getWeeklyTopicsHome,
  type HomeTopicsResponse,
  type PeriodTopicsHomeResponse,
} from "@/lib/api/topics";

type PeriodTopicsResult<T> =
  | {
      status: "success";
      response: T;
    }
  | {
      status: "error";
    };

function formatDateLabel(dateValue: string | null) {
  if (!dateValue) {
    return undefined;
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

function formatPeriodLabel({
  topicDate,
  periodStart,
  periodEnd,
}: {
  topicDate: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
}) {
  if (periodStart && periodEnd) {
    const startLabel = formatDateLabel(periodStart);
    const endLabel = formatDateLabel(periodEnd);

    return startLabel && endLabel ? `${startLabel} - ${endLabel}` : undefined;
  }

  return formatDateLabel(topicDate);
}

async function toResult<T>(
  loader: () => Promise<T>,
): Promise<PeriodTopicsResult<T>> {
  try {
    return {
      status: "success",
      response: await loader(),
    };
  } catch {
    return { status: "error" };
  }
}

function toDailySection(
  result: PeriodTopicsResult<HomeTopicsResponse>,
): PeriodTopicSectionData {
  if (result.status === "error") {
    return {
      status: "error",
      title: "오늘의 주요 이슈",
      topics: [],
      emptyMessage: "오늘 생성된 주요 이슈가 없습니다.",
      errorMessage: "오늘의 주요 이슈를 불러오지 못했습니다.",
    };
  }

  return {
    status: "success",
    title: "오늘의 주요 이슈",
    emptyMessage: "오늘 생성된 주요 이슈가 없습니다.",
    errorMessage: "오늘의 주요 이슈를 불러오지 못했습니다.",
    topics: result.response.items.slice(0, 3).map(
      (topic): PeriodTopicCardItem => ({
        id: topic.id,
        periodLabel: formatPeriodLabel({ topicDate: topic.topic_date }),
        dateTime: topic.topic_date ?? undefined,
        title: topic.title_ko,
        summary: topic.summary_ko,
        href: `/topics/${topic.id}`,
      }),
    ),
  };
}

function toPeriodSection({
  result,
  title,
  emptyMessage,
  errorMessage,
  hrefPrefix,
}: {
  result: PeriodTopicsResult<PeriodTopicsHomeResponse>;
  title: string;
  emptyMessage: string;
  errorMessage: string;
  hrefPrefix: "/three-day-topics" | "/weekly-topics";
}): PeriodTopicSectionData {
  if (result.status === "error") {
    return {
      status: "error",
      title,
      topics: [],
      emptyMessage,
      errorMessage,
    };
  }

  return {
    status: "success",
    title,
    emptyMessage,
    errorMessage,
    topics: result.response.items.map(
      (topic): PeriodTopicCardItem => ({
        id: topic.id,
        title: topic.title_ko,
        summary: topic.summary_ko,
        href: `${hrefPrefix}/${topic.id}`,
      }),
    ),
  };
}

async function PeriodTopicExperience() {
  const [dailyResult, threeDayResult, weeklyResult] = await Promise.all([
    toResult(getHomeTopics),
    toResult(getThreeDayTopicsHome),
    toResult(getWeeklyTopicsHome),
  ]);

  return (
    <PeriodTopicHome
      daily={toDailySection(dailyResult)}
      threeDay={toPeriodSection({
        result: threeDayResult,
        title: "최근 3일 흐름",
        emptyMessage: "최근 3일 동안 생성된 뉴스 흐름이 없습니다.",
        errorMessage: "최근 3일 흐름을 불러오지 못했습니다.",
        hrefPrefix: "/three-day-topics",
      })}
      weekly={toPeriodSection({
        result: weeklyResult,
        title: "지난주 흐름",
        emptyMessage: "지난 완료 주간에 생성된 뉴스 흐름이 없습니다.",
        errorMessage: "지난주 흐름을 불러오지 못했습니다.",
        hrefPrefix: "/weekly-topics",
      })}
    />
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader />

      <PageShell className="space-y-7 sm:space-y-10">
        <Suspense fallback={<PeriodTopicHomeLoading />}>
          <PeriodTopicExperience />
        </Suspense>
      </PageShell>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          <div className="flex flex-col gap-1">
            <strong className="font-semibold text-slate-600">NewsLab Web</strong>
            <span>여러 출처의 뉴스를 주요 이슈와 요약으로 정리합니다.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
