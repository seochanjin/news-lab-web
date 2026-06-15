import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicList, TopicListLoading } from "@/components/topics/TopicList";

function TopicExperience() {
  return (
    <>
      <section className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="bg-teal-700 px-2 py-1 text-white">DAILY TOPICS</span>
          <span className="text-slate-500">자동 생성된 주요 이슈</span>
        </div>
        <h1 className="mt-5 text-2xl font-bold leading-9 text-slate-950 sm:text-3xl sm:leading-10">
          오늘 움직이는 뉴스 흐름을
          <br />
          주요 이슈로 먼저 확인하세요.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          여러 출처의 기사를 주제와 키워드 단위로 정리해, 중요한 변화와
          연결된 원문을 함께 살펴볼 수 있습니다.
        </p>
      </section>

      <Suspense fallback={<TopicListLoading />}>
        <TopicList />
      </Suspense>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader />

      <PageShell className="space-y-8">
        <TopicExperience />
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
