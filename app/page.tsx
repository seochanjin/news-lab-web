import { Suspense } from "react";
import {
  ArticleList as ArticleRows,
  ArticleListState,
} from "@/components/articles/ArticleList";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TopicList, TopicListLoading } from "@/components/topics/TopicList";
import { getArticles } from "@/lib/api/articles";

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

async function getHomeArticles() {
  try {
    return await getArticles();
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
        hasNext={result.has_next}
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

function HomeArticleListLoading() {
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

function TopicExperience() {
  return (
    <>
      <section className="border border-slate-200 bg-white px-5 py-6 sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="bg-teal-700 px-2 py-1 text-white">DAILY TOPICS</span>
          <span className="text-slate-500">자동 생성된 주요 이슈 연결</span>
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
          오늘의 주요 이슈는 실제 Topics API 데이터입니다. 아래 키워드와
          기사 묶음은 화면 방향 검증을 위한 예시 데이터입니다.
        </p>
      </section>

      <Suspense fallback={<TopicListLoading />}>
        <TopicList />
      </Suspense>

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
      <SiteHeader />

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,760px)_minmax(0,1fr)] lg:py-8">
        <div
          aria-hidden="true"
          className="hidden min-w-0 lg:block"
          data-layout-slot="left"
        />

        <div className="min-w-0 space-y-8 lg:col-start-2">
          <TopicExperience />

          <section className="space-y-4">
            <SectionHeading
              description="아래 목록은 NewsLab backend의 /articles API에서 가져온 실제 최신 기사입니다."
              eyebrow="LATEST ARTICLES"
              title="최신 기사 이어보기"
            />
            <Suspense fallback={<HomeArticleListLoading />}>
              <HomeArticleList />
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
