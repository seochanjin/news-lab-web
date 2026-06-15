import Link from "next/link";
import {
  ArticleList,
  ArticleListState,
} from "@/components/articles/ArticleList";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getArticles } from "@/lib/api/articles";

const categoryLabels: Record<string, string> = {
  ai: "AI",
  economy: "경제",
  politics: "정치",
  society: "사회",
  tech: "기술",
  world: "세계",
};

function getSearchParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string | string[];
    category?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = getSearchParam(params.query);
  const requestedCategory = getSearchParam(params.category).toLowerCase();
  const category = categoryLabels[requestedCategory]
    ? requestedCategory
    : undefined;
  const response = await getArticles(1, 10, { query, category });
  const hasFilters = Boolean(query || category);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <SiteHeader activeCategory={category ?? "all"} initialQuery={query} />

      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
          <p className="text-xs font-semibold text-teal-700">ARTICLE SEARCH</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            기사 탐색
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            NewsLab이 수집한 기사 목록을 검색어와 카테고리로 탐색합니다.
            기사 제목을 선택하면 원문을 새 탭에서 확인할 수 있습니다.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
            <span className="font-semibold text-slate-700">
              {hasFilters ? "현재 탐색 조건" : "전체 최신 기사"}
            </span>
            {query ? (
              <span className="border border-teal-100 bg-teal-50 px-2 py-1 text-teal-800">
                검색어: {query}
              </span>
            ) : null}
            {category ? (
              <span className="border border-teal-100 bg-teal-50 px-2 py-1 text-teal-800">
                카테고리: {categoryLabels[category]}
              </span>
            ) : null}
            {hasFilters ? (
              <Link
                className="ml-auto font-semibold text-teal-700 hover:text-teal-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
                href="/articles"
              >
                조건 초기화
              </Link>
            ) : null}
          </div>
        </section>

        <section
          aria-labelledby="article-results-heading"
          className="border border-slate-200 bg-white"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
            <div>
              <p className="text-xs font-semibold text-teal-700">
                SEARCH RESULTS
              </p>
              <h2
                className="mt-1 text-lg font-bold text-slate-950"
                id="article-results-heading"
              >
                기사 목록
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              전체 <strong className="text-slate-700">{response.total}</strong>
              건 중{" "}
              <strong className="text-slate-700">{response.count}</strong>건
              표시
            </p>
          </div>

          {response.articles.length > 0 ? (
            <ArticleList articles={response.articles} />
          ) : (
            <ArticleListState
              description={
                hasFilters
                  ? "검색어 또는 카테고리를 조정해보세요."
                  : "새 기사가 수집되면 이곳에 표시됩니다."
              }
              title={
                hasFilters
                  ? "조건에 맞는 기사가 없습니다."
                  : "아직 수집된 기사가 없습니다."
              }
            />
          )}
        </section>
      </main>
    </div>
  );
}
