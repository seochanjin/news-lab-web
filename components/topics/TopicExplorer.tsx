import { TopicCard } from "@/components/topics/TopicCard";
import type { Topic } from "@/lib/api/topics";

export function TopicExplorer({
  initialTopics,
  total,
}: {
  initialTopics: Topic[];
  total: number;
}) {
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
            {initialTopics.length}
          </strong>
          개 표시
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {initialTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
}
