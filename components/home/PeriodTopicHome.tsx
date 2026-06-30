import { DailyTopicHighlights } from "@/components/home/DailyTopicHighlights";
import { PeriodTopicSection } from "@/components/home/PeriodTopicSection";
import type { PeriodTopicCardItem } from "@/components/home/PeriodTopicSection";

type PeriodTopicHomeProps = {
  daily: PeriodTopicSectionData;
  threeDay: PeriodTopicSectionData;
  weekly: PeriodTopicSectionData;
};

export type PeriodTopicSectionData = {
  status: "success" | "error";
  title: string;
  topics: PeriodTopicCardItem[];
  emptyMessage: string;
  errorMessage: string;
};

function PeriodTopicState({
  title,
  message,
  description,
  headingLevel = 2,
}: {
  title: string;
  message: string;
  description?: string;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section className="space-y-4" aria-labelledby={`${title}-heading`}>
      <div>
        <Heading
          className="text-lg font-bold text-slate-950"
          id={`${title}-heading`}
        >
          {title}
        </Heading>
      </div>
      <div className="border border-slate-200 bg-white px-5 py-8 text-center sm:px-7 sm:py-9">
        <p className="text-sm font-semibold text-slate-700">{message}</p>
        {description ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function PeriodTopicSectionOrState({
  section,
}: {
  section: PeriodTopicSectionData;
}) {
  if (section.status === "error") {
    return (
      <PeriodTopicState
        description="잠시 후 다시 시도해 주세요."
        message={section.errorMessage}
        title={section.title}
      />
    );
  }

  return (
    <PeriodTopicSection {...section} />
  );
}

function DailyTopicSectionOrState({
  section,
}: {
  section: PeriodTopicSectionData;
}) {
  if (section.status === "error") {
    return (
      <PeriodTopicState
        description="잠시 후 다시 시도해 주세요."
        headingLevel={1}
        message={section.errorMessage}
        title={section.title}
      />
    );
  }

  return (
    <DailyTopicHighlights
      emptyMessage={section.emptyMessage}
      title={section.title}
      topics={section.topics}
    />
  );
}

export function PeriodTopicHome({
  daily,
  threeDay,
  weekly,
}: PeriodTopicHomeProps) {
  return (
    <div className="space-y-7 sm:space-y-10">
      <DailyTopicSectionOrState section={daily} />
      <PeriodTopicSectionOrState section={threeDay} />
      <PeriodTopicSectionOrState section={weekly} />
    </div>
  );
}

export function PeriodTopicHomeLoading() {
  return (
    <div className="space-y-7 sm:space-y-10">
      {["오늘의 주요 이슈", "최근 3일 흐름", "지난주 흐름"].map((title) => (
        <PeriodTopicState
          headingLevel={title === "오늘의 주요 이슈" ? 1 : 2}
          key={title}
          message={`${title}을 불러오는 중입니다.`}
          title={title}
        />
      ))}
    </div>
  );
}
