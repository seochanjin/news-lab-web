import Link from "next/link";
import { TopicCard } from "@/components/topics/TopicCard";
import { getHomeTopics, type HomeTopicsResponse } from "@/lib/api/topics";

type TopicsResult =
  | {
      status: "success";
      response: HomeTopicsResponse;
    }
  | {
      status: "error";
    };

async function getTopicsResult(): Promise<TopicsResult> {
  try {
    return {
      status: "success",
      response: await getHomeTopics(),
    };
  } catch {
    return { status: "error" };
  }
}

function TopicListHeader({
  count,
  total,
}: {
  count?: number;
  total?: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="mt-1 text-lg font-bold text-slate-950">
          오늘의 주요 이슈
        </h2>
      </div>
      <div className="max-w-sm text-right">
        <p className="text-xs leading-5 text-slate-500">
          {typeof count === "number" && typeof total === "number"
            ? `자동 생성된 전체 ${total}개 이슈 중 ${count}개를 표시합니다.`
            : typeof count === "number"
              ? `주요 이슈 ${count}개를 표시합니다.`
            : "여러 출처의 기사를 하나의 흐름으로 정리한 daily topic summary입니다."}
        </p>
        <Link
          className="mt-2 inline-flex text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          href="/topics"
        >
          전체 주요 이슈 보기
        </Link>
      </div>
    </div>
  );
}

function TopicListState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border border-slate-200 bg-white px-5 py-14 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

export async function TopicList() {
  const result = await getTopicsResult();

  if (result.status === "error") {
    return (
      <section className="space-y-4">
        <TopicListHeader />
        <TopicListState
          description="잠시 후 다시 시도해 주세요."
          title="주요 이슈를 불러오지 못했습니다."
        />
      </section>
    );
  }

  const { response } = result;

  return (
    <section className="space-y-4">
      <TopicListHeader count={response.items.length} />
      {response.items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {response.items.map((topic, index) => (
            <div
              className={index === 0 ? "sm:col-span-2" : ""}
              key={topic.id}
            >
              <TopicCard topic={topic} />
            </div>
          ))}
        </div>
      ) : (
        <TopicListState
          description="새로운 daily topic summary가 생성되면 이곳에 표시됩니다."
          title="아직 생성된 주요 이슈가 없습니다."
        />
      )}
    </section>
  );
}

export function TopicListLoading() {
  return (
    <section className="space-y-4">
      <TopicListHeader />
      <TopicListState
        description="자동 생성된 daily topic summary를 가져오는 중입니다."
        title="오늘의 주요 이슈를 불러오는 중입니다."
      />
    </section>
  );
}
