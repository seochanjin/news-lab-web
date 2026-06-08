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

type MockTopic = {
  id: string;
  category: string;
  title: string;
  summary: string;
  signals: string[];
  articleCount: number;
};

type MockKeyword = {
  rank: number;
  label: string;
  context: string;
};

type MockArticleGroup = {
  id: string;
  title: string;
  description: string;
  sourceCount: number;
  articleTitles: string[];
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

const mockTopics: MockTopic[] = [
  {
    id: "ai-security",
    category: "해외 기술",
    title: "AI 서비스 확산과 보안 기준 논의",
    summary:
      "기업용 AI 도입이 늘면서 데이터 보호, 모델 검증, 서비스 책임 범위를 둘러싼 논의가 함께 커지는 흐름입니다.",
    signals: ["기업용 AI", "보안 기준", "데이터 보호"],
    articleCount: 14,
  },
  {
    id: "chip-investment",
    category: "기술 · 경제",
    title: "반도체 투자 경쟁과 공급망 재편",
    summary:
      "주요 기업의 설비 투자와 각국 지원 정책이 맞물리며 반도체 공급망 주도권 경쟁이 이어지는 흐름입니다.",
    signals: ["반도체", "설비 투자", "공급망"],
    articleCount: 11,
  },
  {
    id: "global-tension",
    category: "국제 정세",
    title: "분쟁 지역 긴장과 외교 대응",
    summary:
      "분쟁 관련 속보와 주요국 외교 발언이 연이어 나오며 에너지와 금융시장 변동성에도 관심이 모이고 있습니다.",
    signals: ["국제 정세", "외교", "에너지"],
    articleCount: 9,
  },
];

const mockKeywords: MockKeyword[] = [
  { rank: 1, label: "생성형 AI", context: "기술 · 보안" },
  { rank: 2, label: "반도체 투자", context: "산업 · 공급망" },
  { rank: 3, label: "금리 전망", context: "경제 · 시장" },
  { rank: 4, label: "국제 정세", context: "세계 · 속보" },
  { rank: 5, label: "플랫폼 규제", context: "정책 · 기술" },
  { rank: 6, label: "데이터 보호", context: "AI · 보안" },
];

const mockArticleGroups: MockArticleGroup[] = [
  {
    id: "enterprise-ai",
    title: "기업용 AI 도입과 안전 기준",
    description:
      "비슷한 주제를 다루는 기사들이 어떤 묶음으로 정리될 수 있는지 보여주는 예시입니다.",
    sourceCount: 4,
    articleTitles: [
      "기업용 생성형 AI 도입 범위 확대",
      "AI 서비스 보안 점검 기준 논의",
      "데이터 보호와 업무 자동화의 균형",
    ],
  },
  {
    id: "market-flow",
    title: "기술 투자와 시장 반응",
    description:
      "투자, 공급망, 시장 전망 기사를 하나의 흐름으로 연결하는 제품 방향 목업입니다.",
    sourceCount: 3,
    articleTitles: [
      "반도체 설비 투자 계획 잇따라 발표",
      "글로벌 공급망 재편 움직임 지속",
      "기술주 중심 시장 전망 엇갈려",
    ],
  },
];

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
        <p className="text-xs font-semibold text-teal-700">REAL-TIME ARTICLES</p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">최신 기사</h2>
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
      <section className="min-w-0 border border-slate-200 bg-white">
        <ArticleListHeader />
        <ArticleListState
          description="잠시 후 다시 시도해 주세요."
          title="기사 목록을 불러오지 못했습니다."
        />
      </section>
    );
  }

  return (
    <section className="min-w-0 border border-slate-200 bg-white">
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
    <section className="min-w-0 border border-slate-200 bg-white">
      <ArticleListHeader />
      <ArticleListState
        description="최신 기사 데이터를 가져오는 중입니다."
        title="기사 목록을 불러오고 있습니다."
      />
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold text-teal-700">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-bold text-slate-950">{title}</h2>
      </div>
      <p className="max-w-sm text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}

function TopicPrototype() {
  return (
    <>
      <section className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="bg-teal-700 px-2 py-1 text-white">
            제품 방향 목업
          </span>
          <span className="text-slate-500">토픽 정리 기능 검토 중</span>
        </div>
        <h1 className="mt-5 text-2xl font-bold leading-9 text-slate-950 sm:text-3xl sm:leading-10">
          흩어진 기사보다,
          <br />
          오늘 움직이는 뉴스 흐름을 먼저 봅니다.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          NewsLab은 여러 출처의 기사를 주제와 키워드 단위로 정리해, 개별
          기사를 모두 읽기 전에도 중요한 변화를 파악할 수 있는 서비스를
          지향합니다.
        </p>
        <p className="mt-4 border-l-2 border-amber-400 pl-3 text-xs leading-5 text-slate-500">
          아래 토픽, 키워드, 기사 묶음은 화면 방향 검증을 위한 예시
          데이터이며 실제 분석이나 검증 결과가 아닙니다.
        </p>
      </section>

      <section className="space-y-4">
        <SectionHeading
          description="여러 뉴스가 하나의 이슈로 묶이는 화면을 가정한 예시입니다."
          eyebrow="PROTOTYPE TOPICS"
          title="오늘의 주요 흐름"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {mockTopics.map((topic, index) => (
            <article
              className={`border border-slate-200 bg-white p-5 ${
                index === 0 ? "sm:col-span-2" : ""
              }`}
              key={topic.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-teal-700">
                  {topic.category}
                </span>
                <span className="text-xs text-slate-400">
                  예시 기사 {topic.articleCount}건
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold leading-6 text-slate-950">
                {topic.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {topic.summary}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {topic.signals.map((signal) => (
                  <li
                    className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                    key={signal}
                  >
                    {signal}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <SectionHeading
            description="실제 추출 결과가 아닌 제품 화면 검토용 순위입니다."
            eyebrow="MOCK KEYWORDS"
            title="많이 보이는 키워드"
          />
        </div>
        <ol className="grid sm:grid-cols-2">
          {mockKeywords.map((keyword) => (
            <li
              className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-child(odd)]:border-r"
              key={keyword.label}
            >
              <span className="w-5 text-center text-xs font-bold text-teal-700">
                {keyword.rank}
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                {keyword.label}
              </span>
              <span className="text-xs text-slate-400">{keyword.context}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <SectionHeading
          description="유사 기사를 묶어 비교하는 경험을 가정한 mock preview입니다."
          eyebrow="GROUP PREVIEW"
          title="관련 기사 묶음"
        />
        <div className="space-y-3">
          {mockArticleGroups.map((group) => (
            <article className="border border-slate-200 bg-white" key={group.id}>
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {group.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    예시 출처 {group.sourceCount}곳
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {group.description}
                </p>
              </div>
              <ul className="divide-y divide-slate-100 px-5">
                {group.articleTitles.map((title) => (
                  <li
                    className="flex items-start gap-3 py-3 text-sm leading-6 text-slate-700"
                    key={title}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 bg-teal-600"
                    />
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
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

        <div className="min-w-0 space-y-8 lg:col-start-2">
          <TopicPrototype />

          <section className="space-y-4">
            <SectionHeading
              description="아래 목록은 NewsLab backend의 /articles API에서 가져온 실제 최신 기사입니다."
              eyebrow="LATEST ARTICLES"
              title="최신 기사 이어보기"
            />
            <Suspense fallback={<ArticleListLoading />}>
              <ArticleList />
            </Suspense>
          </section>
        </div>

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
