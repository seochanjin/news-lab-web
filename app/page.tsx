import { Suspense } from "react";

type ArticlesApiArticle = {
  id: number;
  source_id: number;
  source: string;
  title: string;
  url: string;
  category: string;
  summary: string | null;
  published_at: string | null;
  tags: string[];
  created_at: string;
};

type ArticlesApiResponse = {
  page: number;
  page_size: number;
  count: number;
  total: number;
  has_next: boolean;
  articles: ArticlesApiArticle[];
};

type ArticleViewModel = {
  id: number;
  category: string;
  title: string;
  source: string;
  publishedAt: string;
  metadata?: string;
  url?: string;
};

type ArticlesResult =
  | {
      status: "success";
      articles: ArticleViewModel[];
      count: number;
      total: number;
      hasNext: boolean;
    }
  | {
      status: "error";
    };

const categories = ["전체", "정치", "경제", "기술", "세계", "사회", "AI"];

const categoryLabels: Record<string, string> = {
  ai: "AI",
  business: "경제",
  economy: "경제",
  politics: "정치",
  society: "사회",
  tech: "기술",
  technology: "기술",
  world: "세계",
};

function isArticlesApiResponse(value: unknown): value is ArticlesApiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<ArticlesApiResponse>;

  return (
    typeof response.page === "number" &&
    typeof response.page_size === "number" &&
    typeof response.count === "number" &&
    typeof response.total === "number" &&
    typeof response.has_next === "boolean" &&
    Array.isArray(response.articles)
  );
}

function formatCategory(category: string) {
  const normalizedCategory = category.trim().toLowerCase();

  return categoryLabels[normalizedCategory] || category.trim() || "기타";
}

function formatPublishedAt(publishedAt: string | null) {
  if (!publishedAt) {
    return "발행 시간 미상";
  }

  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return "발행 시간 미상";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function getSafeArticleUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return ["http:", "https:"].includes(parsedUrl.protocol)
      ? parsedUrl.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function getArticleMetadata(article: ArticlesApiArticle) {
  const summary = article.summary?.trim();

  if (summary) {
    return summary;
  }

  if (article.tags.length > 0) {
    return article.tags
      .slice(0, 3)
      .map((tag) => `#${tag}`)
      .join(" ");
  }

  return undefined;
}

function toArticleViewModel(article: ArticlesApiArticle): ArticleViewModel {
  return {
    id: article.id,
    category: formatCategory(article.category),
    title: article.title,
    source: article.source,
    publishedAt: formatPublishedAt(article.published_at),
    metadata: getArticleMetadata(article),
    url: getSafeArticleUrl(article.url),
  };
}

async function getArticles(): Promise<ArticlesResult> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_NEWSLAB_API_BASE_URL;

  if (!apiBaseUrl) {
    return { status: "error" };
  }

  try {
    const endpoint = new URL("/articles", apiBaseUrl);
    endpoint.searchParams.set("page", "1");
    endpoint.searchParams.set("page_size", "10");

    const response = await fetch(endpoint, { cache: "no-store" });

    if (!response.ok) {
      return { status: "error" };
    }

    const data: unknown = await response.json();

    if (!isArticlesApiResponse(data)) {
      return { status: "error" };
    }

    return {
      status: "success",
      articles: data.articles.map(toArticleViewModel),
      count: data.count,
      total: data.total,
      hasNext: data.has_next,
    };
  } catch {
    return { status: "error" };
  }
}

function ArticleListHeader({
  count,
  total,
  hasNext,
}: {
  count?: number;
  total?: number;
  hasNext?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
      <div>
        <p className="text-xs font-semibold text-teal-700">LATEST NEWS</p>
        <h1 className="mt-1 text-lg font-bold text-slate-950">최신 기사</h1>
      </div>
      {typeof count === "number" && typeof total === "number" ? (
        <p className="text-xs text-slate-500">
          전체 <strong className="text-slate-700">{total}</strong>건 중{" "}
          <strong className="text-slate-700">{count}</strong>건
          {hasNext ? " 표시" : ""}
        </p>
      ) : null}
    </div>
  );
}

function ArticleRows({ articles }: { articles: ArticleViewModel[] }) {
  return (
    <ol className="divide-y divide-slate-100">
      {articles.map((article) => (
        <li
          className="group px-4 py-4 hover:bg-slate-50 sm:px-5"
          key={article.id}
        >
          <article className="grid gap-2 sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
            <div>
              <span className="inline-flex border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                {article.category}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold leading-6 text-slate-900 group-hover:text-teal-800 sm:text-[15px]">
                {article.url ? (
                  <a
                    className="hover:underline"
                    href={article.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {article.title}
                  </a>
                ) : (
                  article.title
                )}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span className="font-medium text-slate-500">
                  {article.source}
                </span>
                <time>{article.publishedAt}</time>
              </div>
              {article.metadata ? (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                  {article.metadata}
                </p>
              ) : null}
            </div>
            <span
              aria-hidden="true"
              className="hidden text-lg text-slate-300 group-hover:text-teal-700 sm:block"
            >
              ›
            </span>
          </article>
        </li>
      ))}
    </ol>
  );
}

function ArticleListState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="px-5 py-16 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

async function ArticleList() {
  const result = await getArticles();

  if (result.status === "error") {
    return (
      <section className="min-w-0 border border-slate-200 bg-white lg:col-start-2">
        <ArticleListHeader />
        <ArticleListState
          description="잠시 후 다시 시도해 주세요."
          title="기사 목록을 불러오지 못했습니다."
        />
      </section>
    );
  }

  return (
    <section className="min-w-0 border border-slate-200 bg-white lg:col-start-2">
      <ArticleListHeader
        count={result.count}
        hasNext={result.hasNext}
        total={result.total}
      />
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

function ArticleListLoading() {
  return (
    <section className="min-w-0 border border-slate-200 bg-white lg:col-start-2">
      <ArticleListHeader />
      <ArticleListState
        description="최신 기사 데이터를 가져오는 중입니다."
        title="기사 목록을 불러오고 있습니다."
      />
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)] lg:items-center lg:py-6">
          <div className="flex items-baseline gap-3 lg:justify-self-start">
            <span className="text-2xl font-black text-teal-700">NewsLab</span>
            <span className="text-xs font-medium text-slate-400">
              뉴스를 한눈에
            </span>
          </div>

          <form className="flex w-full lg:col-start-2" role="search">
            <label className="sr-only" htmlFor="news-search">
              뉴스 검색
            </label>
            <input
              className="min-w-0 flex-1 border border-r-0 border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-teal-600"
              id="news-search"
              name="query"
              placeholder="뉴스 제목이나 키워드를 검색하세요"
              type="search"
            />
            <button
              className="border border-teal-700 bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              type="submit"
            >
              검색
            </button>
          </form>
        </div>

        <nav aria-label="뉴스 카테고리" className="border-t border-slate-100">
          <div className="mx-auto grid w-full max-w-7xl px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)]">
            <ul className="flex gap-1 overflow-x-auto lg:col-start-2">
              {categories.map((category, index) => (
                <li key={category}>
                  <a
                    aria-current={index === 0 ? "page" : undefined}
                    className={`block whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${
                      index === 0
                        ? "border-teal-700 text-teal-700"
                        : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-950"
                    }`}
                    href={index === 0 ? "/" : `/?category=${category}`}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)] lg:py-8">
        <div
          aria-hidden="true"
          className="hidden min-w-0 lg:block"
          data-layout-slot="left"
        />

        <Suspense fallback={<ArticleListLoading />}>
          <ArticleList />
        </Suspense>

        <div
          aria-hidden="true"
          className="hidden min-w-0 lg:block"
          data-layout-slot="right"
        />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-7xl px-4 py-5 text-xs text-slate-400 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-1 lg:col-start-2">
            <strong className="font-semibold text-slate-600">NewsLab Web</strong>
            <span>기사 목록은 NewsLab backend API에서 제공됩니다.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
