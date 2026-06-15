import Link from "next/link";
import { Suspense } from "react";
import {
  ArticleList as ArticleRows,
  ArticleListState,
} from "@/components/articles/ArticleList";
import { PageShell } from "@/components/layout/PageShell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicList, TopicListLoading } from "@/components/topics/TopicList";
import { getArticles } from "@/lib/api/articles";

function ArticleListHeader({ count }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
      <div>
        <p className="text-xs font-semibold text-teal-700">SOURCE ARTICLES</p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">
          최신 원문 기사
        </h2>
      </div>
      {typeof count === "number" ? (
        <p className="text-xs text-slate-500">{count}건 미리보기</p>
      ) : null}
    </div>
  );
}

async function getHomeArticles() {
  try {
    return await getArticles(1, 3);
  } catch {
    return null;
  }
}

async function HomeArticleList() {
  const result = await getHomeArticles();

  if (!result) {
    return (
      <section className="min-w-0 border border-slate-200 bg-white">
        <ArticleListHeader />
        <ArticleListState
          description="잠시 후 다시 시도하거나 원문 모음에서 검색해 주세요."
          title="기사 목록을 불러오지 못했습니다."
        />
      </section>
    );
  }

  return (
    <section className="min-w-0 border border-slate-200 bg-white">
      <ArticleListHeader count={result.count} />
      {result.articles.length > 0 ? (
        <ArticleRows articles={result.articles} />
      ) : (
        <ArticleListState
          description="새 기사가 수집되면 이곳에 표시됩니다."
          title="표시할 기사가 없습니다."
        />
      )}
    </section>
  );
}

function HomeArticleListLoading() {
  return (
    <section className="min-w-0 border border-slate-200 bg-white">
      <ArticleListHeader />
      <ArticleListState
        description="최신 원문 기사 데이터를 가져오는 중입니다."
        title="기사 목록을 불러오고 있습니다."
      />
    </section>
  );
}

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

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-teal-700">
                SUPPORTING SOURCES
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                원문 기사 이어보기
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
                주요 이슈의 근거가 되는 최신 원문 일부를 확인합니다.
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
              href="/articles"
            >
              원문 모음 전체 보기
            </Link>
          </div>
          <Suspense fallback={<HomeArticleListLoading />}>
            <HomeArticleList />
          </Suspense>
        </section>
      </PageShell>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          <div className="flex flex-col gap-1">
            <strong className="font-semibold text-slate-600">NewsLab Web</strong>
            <span>기사 목록은 NewsLab backend API에서 제공됩니다.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
